<script module>
	import { writable, get } from 'svelte/store'
	const orientation = writable('horizontal')
</script>

<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog'
	import { PaneGroup, Pane, PaneResizer } from 'paneforge'
	import LargeSwitch from '../../../ui/LargeSwitch.svelte'
	import FullCodeEditor from './FullCodeEditor.svelte'
	import ComponentPreview, { refresh_preview, has_error } from '$lib/builder/components/ComponentPreview.svelte'
	import Fields from '../../../components/Fields/FieldsContent.svelte'
	import { locale } from '../../../stores/app/misc.js'
	import hotkey_events from '../../../stores/app/hotkey_events.js'
	import { getContent } from '$lib/pocketbase/content'
	import { PageSectionEntries, PageSections, PageEntries, PageTypeSectionEntries, SiteSymbolFields, SiteSymbols, SiteEntries, manager } from '$lib/pocketbase/collections'
	import { get_empty_value } from '$lib/builder/utils.js'
	import type { ObjectOf } from '$lib/pocketbase/CollectionMapping'
	import type { PageTypeSection } from '$lib/common/models/PageTypeSection'

	let {
		component,
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
	}: { component: ObjectOf<typeof PageTypeSection> | ObjectOf<typeof PageSections>; tab: string; header?: any } = $props()

	// Data will be loaded automatically by CollectionMapping system when accessed

	const symbol = $derived(SiteSymbols.one(component.symbol))
	const fields = $derived(symbol?.fields())
	const entries = $derived('page_type' in component ? component.entries() : 'page' in component ? component.entries() : undefined)
	const component_data = $derived(fields && entries && (getContent(component, fields, entries)[$locale] ?? {}))

	let loading = false

	hotkey_events.on('e', toggle_tab)

	function toggle_tab() {
		tab = tab === 'code' ? 'content' : 'code'
	}

	async function save_component() {
		// if (!$preview_updated) {
		// 	await refresh_preview()
		// }

		if (!$has_error && symbol) {
			SiteSymbols.update(symbol.id, { html, css, js })
			await manager.commit()

			header.button.onclick()
		}
	}

	let html = $state(symbol?.html ?? '')
	let css = $state(symbol?.css ?? '')
	let js = $state(symbol?.js ?? '')

	// Create code object for ComponentPreview)
	let code = $derived({
		html: html || '<!-- Add your HTML here -->',
		css: css || '/* Add your CSS here */',
		js: js || ''
	})
</script>

<Dialog.Header
	class="mb-2"
	title={symbol?.name || 'Block'}
	button={{
		label: header.button.label || 'Save',
		onclick: save_component,
		disabled: $has_error
	}}
>
	<LargeSwitch bind:active_tab_id={tab} />
</Dialog.Header>

<main lang={$locale}>
	<PaneGroup direction={$orientation} class="flex gap-1">
		<Pane defaultSize={50} class="flex flex-col">
			{#if tab === 'code'}
				<FullCodeEditor
					bind:html
					bind:css
					bind:js
					data={component_data}
					on:save={save_component}
					on:mod-e={toggle_tab}
					on:mod-r={() => $refresh_preview()}
					oninput={() => {
						SiteSymbols.update(symbol.id, { html, css, js })
					}}
				/>
			{:else if tab === 'content' && fields && entries}
				<Fields
					entity={component}
					{fields}
					{entries}
					create_field={(parentId) => {
						if (!symbol) {
							return
						}

						// Get the highest index for fields at this level
						const siblingFields = fields?.filter((f) => f.parent === parentId) || []
						const nextIndex = Math.max(...siblingFields.map((f) => f.index || 0), -1) + 1

						return SiteSymbolFields.create({
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
						console.log({ values, component })
						for (const [key, value] of Object.entries(values)) {
							const field = fields.find((field) => field.key === key)
							if (!field) {
								continue
							}

							const entry = entries.find((entry) => entry.field === field?.id)
							if ('page_type' in component) {
								if (entry) {
									PageTypeSectionEntries.update(entry.id, { value })
								} else {
									PageTypeSectionEntries.create({ field: field.id, locale: 'en', value, section: component.id })
								}
							} else if ('page' in component) {
								if (entry) {
									PageSectionEntries.update(entry.id, { value })
								} else {
									PageSectionEntries.create({ field: field.id, locale: 'en', value, section: component.id })
								}
							}
						}
					}}
					onchange={({ id, data }) => {
						console.log('Updating field:', id, 'with data:', data)
						SiteSymbolFields.update(id, data)
						console.log('Field after update:', SiteSymbolFields.one(id))

						// If field type changed to repeater, create its root entry
						if (data.type === 'repeater') {
							const existing_entry = entries.find((entry) => entry.field === id && !entry.parent)
							console.log('Repeater field created, checking for existing entry:', existing_entry)
							if (!existing_entry) {
								console.log('Creating repeater root entry for field:', id)
								if ('page_type' in component) {
									PageTypeSectionEntries.create({
										field: id,
										locale: 'en',
										value: null,
										parent: null,
										section: component.id
									})
								} else if ('page' in component) {
									PageSectionEntries.create({
										field: id,
										locale: 'en',
										value: null,
										parent: null,
										section: component.id
									})
								}
							} else {
								console.log('Repeater root entry already exists, skipping creation')
							}
						}
					}}
					ondelete={(field_id) => {
						// PocketBase cascade deletion will automatically clean up all associated entries
						SiteSymbolFields.delete(field_id)
					}}
					onadd={({ parent, index, subfields }) => {
						console.log('onadd called with:', { parent, index, subfields })

						// Find the repeater's root entry
						const repeater_entry = entries.find((entry) => entry.field === parent)
						console.log('Found repeater_entry:', repeater_entry)
						if (!repeater_entry) return

						// Create the item entry with repeater entry as parent
						let item_entry
						const item_data = {
							parent: repeater_entry.id, // Parent is the repeater entry
							locale: 'en',
							value: null,
							index,
							section: component.id
						}
						console.log('Creating item entry with data:', item_data)

						if ('page_type' in component) {
							item_entry = PageTypeSectionEntries.create(item_data)
						} else if ('page' in component) {
							item_entry = PageSectionEntries.create(item_data)
						}

						console.log('Created item_entry:', item_entry)
						if (!item_entry) return

						// Create entries for each subfield with appropriate initial values
						subfields.forEach((subfield) => {
							const initial_value = get_empty_value(subfield)
							const subfield_data = {
								field: subfield.id,
								locale: 'en',
								value: initial_value,
								parent: item_entry.id,
								section: component.id
							}
							console.log('Creating subfield entry with data:', subfield_data)

							if ('page_type' in component) {
								const sub_entry = PageTypeSectionEntries.create(subfield_data)
								console.log('Created subfield entry:', sub_entry)
							} else if ('page' in component) {
								const sub_entry = PageSectionEntries.create(subfield_data)
								console.log('Created subfield entry:', sub_entry)
							}
						})
					}}
				/>
			{/if}
		</Pane>
		<PaneResizer class="PaneResizer" />
		<Pane defaultSize={50}>
			{#if component_data}
				<ComponentPreview {code} data={component_data} bind:orientation={$orientation} view="small" {loading} />
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

	:global(.PaneResizer) {
		width: 3px;
		background: var(--color-gray-9);
	}
</style>
