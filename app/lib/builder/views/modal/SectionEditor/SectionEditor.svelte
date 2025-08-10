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
	import Fields, { setFieldEntries } from '../../../components/Fields/FieldsContent.svelte'
	import { locale } from '../../../stores/app/misc.js'
	import hotkey_events from '../../../stores/app/hotkey_events.js'
	import { getContent } from '$lib/pocketbase/content'
	import { PageSectionEntries, PageSections, PageEntries, PageTypeSectionEntries, SiteSymbolFields, SiteSymbols, SiteEntries, manager } from '$lib/pocketbase/collections'
	import type { ObjectOf } from '$lib/pocketbase/CollectionMapping'
	import type { PageTypeSection } from '$lib/common/models/PageTypeSection'
	import { current_user } from '$lib/pocketbase/user'

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
		},
		beforeClose
	}: { 
		component: ObjectOf<typeof PageTypeSection> | ObjectOf<typeof PageSections>; 
		tab: string; 
		header?: any;
		beforeClose?: () => boolean;
	} = $props()

	// Data will be loaded automatically by CollectionMapping system when accessed

	const symbol = $derived(SiteSymbols.one(component.symbol))
	const fields = $derived(symbol?.fields())
	const entries = $derived('page_type' in component ? component.entries() : 'page' in component ? component.entries() : undefined)
	const component_data = $derived(fields && entries && (getContent(component, fields, entries)[$locale] ?? {}))
	
	// Create completions array in field order for autocomplete
	const completions = $derived(
		fields && component_data 
			? fields
				.filter(field => field.key && component_data.hasOwnProperty(field.key))
				.sort((a, b) => (a.index || 0) - (b.index || 0))
				.map(field => {
					const value = component_data[field.key]
					const detail = Array.isArray(value) 
						? `[ ${typeof(value[0])} ]`
						: typeof value === 'object' && value !== null
						? '{ ' + Object.entries(value).map(([key, val]) => `${key}:${typeof(val)}`).join(', ') + ' }'
						: typeof(value)
					
					return {
						label: field.key,
						type: 'variable',
						detail
					}
				})
			: []
	)

	let loading = false

	hotkey_events.on('e', toggle_tab)

	function toggle_tab() {
		if ($current_user?.siteRole !== 'developer') {
			return
		}

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

	// Track initial values to detect changes
	const initial_values = $derived({
		html: symbol?.html ?? '',
		css: symbol?.css ?? '',
		js: symbol?.js ?? ''
	})

	// Track if there are unsaved changes
	const has_unsaved_changes = $derived(
		html !== initial_values.html ||
		css !== initial_values.css ||
		js !== initial_values.js
	)

	// Handle close confirmation
	function handleBeforeClose() {
		if (has_unsaved_changes) {
			return confirm('You have unsaved changes. Are you sure you want to close without saving?')
		}
		return true
	}

	// Set the beforeClose handler if provided
	$effect(() => {
		if (beforeClose) {
			beforeClose = handleBeforeClose
		}
	})

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
	{#if $current_user?.siteRole === 'developer'}
		<LargeSwitch bind:active_tab_id={tab} />
	{/if}
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
					{completions}
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
					create_field={(data) => {
						if (!symbol) {
							return
						}

						// Get the highest index for fields at this level
						const siblingFields = (fields ?? []).filter((f) => (data?.parent ? f.parent === data.parent : !f.parent))
						const nextIndex = Math.max(...siblingFields.map((f) => f.index || 0), -1) + 1

						return SiteSymbolFields.create({
							type: 'text',
							key: '',
							label: '',
							config: null,
							symbol: symbol.id,
							...data,
							index: nextIndex
						})
					}}
					oninput={(values) => {
						if ('page_type' in component) {
							setFieldEntries({
								fields,
								entries,
								updateEntry: PageTypeSectionEntries.update,
								createEntry: (data) => PageTypeSectionEntries.create({ ...data, section: component.id }),
								values
							})
						} else {
							setFieldEntries({
								fields,
								entries,
								updateEntry: PageSectionEntries.update,
								createEntry: (data) => PageSectionEntries.create({ ...data, section: component.id }),
								values
							})
						}
					}}
					onchange={({ id, data }) => {
						SiteSymbolFields.update(id, data)
					}}
					ondelete={(field_id) => {
						// PocketBase cascade deletion will automatically clean up all associated entries
						SiteSymbolFields.delete(field_id)
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
