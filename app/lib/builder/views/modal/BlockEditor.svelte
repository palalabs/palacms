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
	import type { ObjectOf } from '$lib/pocketbase/CollectionMapping.svelte'
	import { SiteSymbolEntries, SiteSymbolFields, SiteSymbols } from '$lib/pocketbase/collections'
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

	const site_id = $derived(page.params.site)
	const new_block = () => SiteSymbols.create({ css: '', html: '', js: '', name: 'New Block', site: site_id })
	const block = $state(existing_block ?? new_block())
	// Data will be loaded automatically by CollectionMapping system when accessed

	// Get fields directly from collection to include staged changes
	const fields = $derived(block ? SiteSymbolFields.list({ filter: `symbol = "${block.id}"` }) : [])
	// Get entries directly from collection to include staged entries
	const entries = $derived(block ? SiteSymbolEntries.list({ filter: `symbol = "${block.id}"` }) : [])
	let component_data = $derived(getContent(block, fields, entries)[$locale] ?? {})

	// Debug: log when fields change
	$effect(() => {
		console.log(
			'Fields changed:',
			fields.map((f) => ({ id: f.id, key: f.key, label: f.label }))
		)
	})

	$inspect({ block, fields, entries })

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
			await SiteSymbols.commit()
			await SiteSymbolFields.commit()
			await SiteSymbolEntries.commit()
			header.button.onclick(block)
		}
	}

	let html = $state('')
	let css = $state('')
	let js = $state('')
	$effect.pre(() => {
		html = block.html
		css = block.css
		js = block.js
	})
	$effect(() => {
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
				<FullCodeEditor bind:html bind:css bind:js data={component_data} on:save={save_component} on:mod-e={toggle_tab} />
			{:else if tab === 'content'}
				<Fields
					entity={block}
					{fields}
					{entries}
					create_field={() => {
						SiteSymbolFields.create({
							type: 'text',
							key: '',
							label: '',
							config: null,
							symbol: block.id
						})
					}}
					oninput={(values) => {
						console.log('oninput')
						for (const [key, value] of Object.entries(values)) {
							const field = fields.find((field) => field.key === key)
							if (!field) {
								continue
							}

							const entry = entries.find((entry) => entry.field === field?.id)
							if (entry) {
								console.log({ entry, value })
								SiteSymbolEntries.update(entry.id, { value })
							} else {
								SiteSymbolEntries.create({ field: field.id, locale: 'en', value })
							}
						}
					}}
					onchange={({ id, data }) => {
						console.log('here', { id, data })
						SiteSymbolFields.update(id, data)
					}}
				/>
			{/if}
		</Pane>
		<PaneResizer class="PaneResizer" />
		<Pane defaultSize={50}>
			<ComponentPreview bind:orientation={$orientation} view="small" {loading} code={{ html, css, js }} data={component_data} />
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
