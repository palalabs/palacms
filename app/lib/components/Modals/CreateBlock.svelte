<script lang="ts">
	import * as _ from 'lodash-es'
	import { PaneGroup, Pane, PaneResizer } from 'paneforge'
	import FullCodeEditor from '$lib/builder/views/modal/SectionEditor/FullCodeEditor.svelte'
	import ComponentPreview, { has_error } from '$lib/builder/components/ComponentPreview.svelte'
	import Fields from '$lib/builder/components/Fields/FieldsContent.svelte'
	import LargeSwitch from '$lib/builder/ui/LargeSwitch.svelte'
	import * as Dialog from '$lib/components/ui/dialog'
	import { static_iframe_srcdoc } from '$lib/builder/components/misc'
	import { SiteSymbolFields, SiteSymbols, SiteSymbolEntries, LibrarySymbolFields, LibrarySymbols, LibrarySymbolEntries, Sites } from '$lib/pocketbase/collections'
	import { getContent } from '$lib/pocketbase/content'
	import { locale } from '$lib/builder/stores/app/misc.js'
	import { page } from '$app/state'

	let {
		symbol: existing_symbol,
		head = '',
		append = '',
		onsubmit,
		symbol_type = 'site'
	}: {
		symbol?: any // Can be SiteSymbol or LibrarySymbol data
		head?: string
		append?: string
		onsubmit: (data: any) => void
		symbol_type?: 'site' | 'library'
	} = $props()

	// Choose the right collections based on symbol type
	const SymbolCollection = symbol_type === 'library' ? LibrarySymbols : SiteSymbols
	const FieldCollection = symbol_type === 'library' ? LibrarySymbolFields : SiteSymbolFields
	const EntryCollection = symbol_type === 'library' ? LibrarySymbolEntries : SiteSymbolEntries

	// Get the current site for site symbols
	const host = $derived(page.url.host)
	const site = $derived(symbol_type === 'site' ? Sites.list({ filter: `host = "${host}"` })?.[0] : null)

	const create_new_symbol = () => {
		if (symbol_type === 'site') {
			if (!site) {
				throw new Error('Site not loaded')
			}
			return SiteSymbols.create({
				css: '/* Add your CSS here */',
				html: '<!-- Add your HTML here -->',
				js: '',
				name: 'New Block',
				site: site.id
			})
		} else {
			// For library symbols, create a temporary one for field editing
			return LibrarySymbols.create({
				css: '/* Add your CSS here */',
				html: '<!-- Add your HTML here -->',
				js: '',
				name: 'New Block'
			})
		}
	}

	const symbol = $state(existing_symbol ? (symbol_type === 'library' ? LibrarySymbols.one(existing_symbol.id) : SiteSymbols.one(existing_symbol.id)) : create_new_symbol())

	// Use the real PocketBase collections
	const fields = $derived(symbol.fields())
	const entries = $derived(symbol.entries())
	let component_data = $derived(fields && entries && (getContent(symbol, fields, entries)[$locale] ?? {}))

	let html = $state(symbol.html)
	let css = $state(symbol.css)
	let js = $state(symbol.js)

	// Create code object for ComponentPreview (matching SectionEditor pattern)
	let code = $derived({
		html: html || '<!-- Add your HTML here -->',
		css: css || '/* Add your CSS here */',
		js: js || ''
	})

	let tab = $state('code')
	function toggle_tab() {
		tab = tab === 'code' ? 'content' : 'code'
	}

	// detect hotkeys from within inputs
	function handle_hotkey(e) {
		const { metaKey, key } = e
		if (metaKey && key === 's') {
			e.preventDefault()
			onsave()
		}
		if (metaKey && key === 'e') {
			e.preventDefault()
			toggle_tab()
		}
	}

	let loading = $state(false)
	async function onsave() {
		loading = true
		try {
			if (!$has_error) {
				// Update the symbol with latest code
				SymbolCollection.update(symbol.id, { html, css, js })

				// Commit all changes to database
				await SymbolCollection.commit()
				await FieldCollection.commit()
				await EntryCollection.commit()

				// Create preview using the raw symbol data
				const preview = static_iframe_srcdoc({
					head: head || '',
					html: html,
					css: css,
					foot: ''
				})

				// Call the onsubmit function with symbol data and preview
				onsubmit({
					name: symbol.name || 'Untitled Block',
					css,
					html,
					js,
					preview,
					symbol: symbol
				})
			}
		} catch (error) {
			console.error('Error in onsave:', error)
		} finally {
			loading = false
		}
	}
</script>

<Dialog.Header
	class="mb-2"
	title="Block"
	button={{
		label: 'Done',
		onclick: onsave,
		loading,
		disabled: false
	}}
>
	<LargeSwitch bind:active_tab_id={tab} />
</Dialog.Header>

<div class="max-h-[91vh] flex-1">
	<PaneGroup direction="horizontal">
		<Pane defaultSize={50}>
			{#if tab === 'code'}
				<FullCodeEditor
					bind:html
					bind:css
					bind:js
					data={component_data}
					on:save={onsave}
					on:mod-e={toggle_tab}
					oninput={() => {
						SymbolCollection.update(symbol.id, { html, css, js })
					}}
				/>
			{:else if tab === 'content' && fields && entries}
				<Fields
					entity={symbol}
					{fields}
					{entries}
					create_field={async (parentId) => {
						// If this is a child field, commit parent fields first to get real database IDs
						if (parentId) {
							try {
								await FieldCollection.commit()
							} catch (error) {
								console.warn('Failed to commit parent fields:', error)
							}
						}

						// Get the highest index for fields at this level
						const siblingFields = fields?.filter((f) => f.parent === parentId) || []
						const nextIndex = Math.max(...siblingFields.map((f) => f.index || 0), -1) + 1

						return FieldCollection.create({
							type: 'text',
							key: '',
							label: '',
							config: null,
							symbol: symbol.id,
							...(parentId ? { parent: parentId } : {}),
							index: nextIndex
						})
					}}
					oninput={(values) => {
						for (const [key, value] of Object.entries(values)) {
							const field = fields.find((field) => field.key === key)
							if (!field) {
								continue
							}

							const entry = entries.find((entry) => entry.field === field?.id)
							if (entry) {
								EntryCollection.update(entry.id, { value })
							} else {
								EntryCollection.create({ field: field.id, locale: 'en', value })
							}
						}
					}}
					onchange={({ id, data }) => {
						FieldCollection.update(id, data)
					}}
					ondelete={(field_id) => {
						FieldCollection.delete(field_id)
					}}
					onkeydown={handle_hotkey}
				/>
			{/if}
		</Pane>
		<PaneResizer class="PaneResizer" />
		<Pane defaultSize={50}>
			<ComponentPreview {code} data={component_data} view="small" {loading} {head} />
		</Pane>
	</PaneGroup>
</div>
