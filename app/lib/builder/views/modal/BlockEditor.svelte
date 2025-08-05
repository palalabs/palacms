<script module>
	import { writable, get } from 'svelte/store'
	const orientation = writable('horizontal')
</script>

<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog'
	import LargeSwitch from '$lib/builder/ui/LargeSwitch.svelte'
	import { PaneGroup, Pane, PaneResizer } from 'paneforge'
	import FullCodeEditor from './SectionEditor/FullCodeEditor.svelte'
	import ComponentPreview, { has_error } from '$lib/builder/components/ComponentPreview.svelte'
	import Fields from '$lib/builder/components/Fields/FieldsContent.svelte'
	import { locale } from '$lib/builder/stores/app/misc.js'
	import hotkey_events from '$lib/builder/stores/app/hotkey_events.js'
	import type { ObjectOf } from '$lib/pocketbase/CollectionMapping'
	import { manager, Sites, SiteSymbolEntries, SiteSymbolFields, SiteSymbols } from '$lib/pocketbase/collections'
	import { page } from '$app/state'
	import { getContent } from '$lib/pocketbase/content'

	let {
		block: existing_block,
		tab = $bindable('content'),
		header = {
			label: 'Create Component',
			icon: 'fas fa-code',
			button: {
				icon: 'fas fa-plus',
				label: 'Add to page',
				onclick: (component) => {
					console.warn('Component not going anywhere', component)
				}
			}
		}
	}: { block?: ObjectOf<typeof SiteSymbols>; tab?: string; header?: any } = $props()

	const host = $derived(page.url.host)
	const site = $derived(Sites.list({ filter: `host = "${host}"` })?.[0])
	const new_block = () => {
		if (!site) {
			throw new Error('Site not loaded')
		}
		return SiteSymbols.create({ css: '', html: '', js: '', name: 'New Block', site: site.id })
	}
	const block = $state(existing_block ?? new_block())

	const fields = $derived(block.fields())
	const entries = $derived(block.entries())
	let component_data = $derived(fields && entries && (getContent(block, fields, entries)[$locale] ?? {}))

	let loading = false

	hotkey_events.on('e', toggle_tab)

	// detect hotkeys from within inputs
	function handle_hotkey(e) {
		const { metaKey, key } = e
		if (metaKey && key === 's') {
			e.preventDefault()
			save_component()
		}
		if (metaKey && key === 'e') {
			e.preventDefault()
			toggle_tab()
		}
	}

	function toggle_tab() {
		tab = tab === 'code' ? 'content' : 'code'
	}

	async function save_component() {
		if (!$has_error) {
			await manager.commit()
			header.button.onclick(block)
		}
	}

	let html = $state(block.html)
	let css = $state(block.css)
	let js = $state(block.js)

	// Create code object for ComponentPreview)
	let code = $derived({
		html: html || '<!-- Add your HTML here -->',
		css: css || '/* Add your CSS here */',
		js: js || ''
	})
</script>

<Dialog.Header
	class="mb-2"
	title={block.name || 'Block'}
	button={{
		...header.button,
		onclick: save_component,
		disabled: $has_error
	}}
>
	<LargeSwitch bind:active_tab_id={tab} />
</Dialog.Header>

<main lang={$locale}>
	<PaneGroup direction={$orientation} class="flex">
		<Pane defaultSize={50}>
			{#if tab === 'code'}
				<FullCodeEditor
					bind:html
					bind:css
					bind:js
					data={component_data}
					on:save={save_component}
					on:mod-e={toggle_tab}
					oninput={() => {
						SiteSymbols.update(block.id, {
							html,
							css,
							js
						})
					}}
				/>
			{:else if tab === 'content' && fields && entries}
				<Fields
					entity={block}
					{fields}
					{entries}
					create_field={async (parentId) => {
						// Get the highest index for fields at this level
						const siblingFields = fields?.filter((f) => f.parent === parentId) || []
						const nextIndex = Math.max(...siblingFields.map((f) => f.index || 0), -1) + 1

						return SiteSymbolFields.create({
							type: 'text',
							key: '',
							label: '',
							config: null,
							symbol: block.id,
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
								SiteSymbolEntries.update(entry.id, { value })
							} else {
								SiteSymbolEntries.create({ field: field.id, locale: 'en', value })
							}
						}
					}}
					onchange={({ id, data }) => {
						SiteSymbolFields.update(id, data)
					}}
					ondelete={(field_id) => {
						SiteSymbolFields.delete(field_id)
					}}
					onadd={({ parent, index, subfields }) => {
						// Create an entry for the repeater item
						SiteSymbolEntries.create({
							field: parent,
							locale: 'en',
							value: {}
						})
					}}
				/>
			{/if}
		</Pane>
		<PaneResizer class="PaneResizer" />
		<Pane defaultSize={50}>
			{#if component_data}
				<ComponentPreview bind:orientation={$orientation} view="small" {loading} {code} data={component_data} />
			{/if}
		</Pane>
	</PaneGroup>
</main>

<style lang="postcss">
	main {
		display: flex; /* to help w/ positioning child items in code view */
		background: var(--primo-color-black);
		color: var(--color-gray-2);
		padding: 0 0.5rem;
		flex: 1;
		overflow: hidden;

		--Button-bg: var(--color-gray-8);
		--Button-bg-hover: var(--color-gray-9);
	}
</style>
