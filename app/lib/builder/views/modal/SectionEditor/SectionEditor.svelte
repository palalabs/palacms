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
	import { PageSectionEntries, PageSections, PageTypeSectionEntries, SiteSymbolFields, SiteSymbols } from '$lib/pocketbase/collections'
	import type { ObjectOf } from '$lib/pocketbase/CollectionMapping.svelte'
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
	const fields = $derived(symbol?.fields() ?? [])
	const entries = $derived('page_type' in component ? (component.entries() ?? []) : 'page' in component ? (component.entries() ?? []) : [])
	const component_data = $derived(getContent(component, fields, entries)[$locale] ?? {})

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
			await SiteSymbols.commit()
			await SiteSymbolFields.commit()

			if ('page_type' in component) {
				PageTypeSectionEntries.commit()
			} else if ('page' in component) {
				PageSectionEntries.commit()
			}

			header.button.onclick()
		}
	}

	let html = $state(symbol?.html ?? '')
	let css = $state(symbol?.css ?? '')
	let js = $state(symbol?.js ?? '')
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
			{:else if tab === 'content'}
				<Fields
					entity={component}
					{fields}
					{entries}
					create_field={() => {
						if (!symbol) {
							return
						}
						SiteSymbolFields.create({
							type: 'text',
							key: '',
							label: '',
							config: null,
							symbol: symbol.id
						})
					}}
					oninput={(values) => {
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
						SiteSymbolFields.update(id, data)
					}}
					ondelete={(field_id) => {
						SiteSymbolFields.delete(field_id)
					}}
				/>
			{/if}
		</Pane>
		<PaneResizer class="PaneResizer" />
		<Pane defaultSize={50}>
			<ComponentPreview
				code={{
					html,
					css,
					js
				}}
				data={component_data}
				bind:orientation={$orientation}
				view="small"
				{loading}
			/>
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
