<script module>
	import { writable, get } from 'svelte/store'
	const orientation = writable('horizontal')
</script>

<script lang="ts">
	import { PaneGroup, Pane, PaneResizer } from 'paneforge'
	import LargeSwitch from '$lib/builder/ui/LargeSwitch.svelte'
	import * as _ from 'lodash-es'
	import ModalHeader from './ModalHeader.svelte'
	import FullCodeEditor from './SectionEditor/FullCodeEditor.svelte'
	import ComponentPreview, { has_error } from '$lib/builder/components/ComponentPreview.svelte'
	import Fields from '$lib/builder/components/Fields/FieldsContent.svelte'
	import { locale } from '$lib/builder/stores/app/misc.js'
	import hotkey_events from '$lib/builder/stores/app/hotkey_events.js'
	import { get_content } from '$lib/builder/stores/helpers'
	import { Symbol } from '$lib/common/models/Symbol'
	import { ID } from '$lib/common/constants'
	import type { Resolved } from '$lib/common/json'

	let {
		block = { name: '', code: { css: '', html: '', js: '' }, fields: [] },
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
	}: { block?: Resolved<typeof Symbol>; tab?: string; header?: any } = $props()

	let loading = false

	let component_data = $derived(get_content(block[ID], block.fields)[$locale])

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
		// TODO: Implement
		throw new Error('Not implemented')
	}
</script>

<ModalHeader
	{...header}
	warn={() => {
		return true
	}}
	icon="lucide:blocks"
	title={block.name || 'Block'}
	button={{
		...header.button,
		onclick: save_component,
		icon: 'material-symbols:save',
		disabled: $has_error
	}}
>
	{#snippet left()}
		<div>
			<!-- TODO: $userRole === 'DEV' -->
			{#if true}
				<LargeSwitch bind:active_tab_id={tab} />
			{/if}
		</div>
	{/snippet}
</ModalHeader>

<main lang={$locale}>
	<PaneGroup direction={$orientation} style="display: flex;">
		<Pane defaultSize={50}>
			{#if tab === 'code'}
				<FullCodeEditor bind:html={block.code.html} bind:css={block.code.css} bind:js={block.code.js} data={component_data} on:save={save_component} on:mod-e={toggle_tab} />
			{:else if tab === 'content'}
				<Fields id={block[ID]} entity_id={block[ID]} fields={block.fields} />
			{/if}
		</Pane>
		<PaneResizer class="PaneResizer" />
		<Pane defaultSize={50}>
			<ComponentPreview bind:orientation={$orientation} view="small" {loading} code={block.code} data={component_data} />
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
