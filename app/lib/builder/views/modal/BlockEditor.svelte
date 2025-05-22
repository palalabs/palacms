<script module>
	import { writable, get } from 'svelte/store'
	const orientation = writable('horizontal')
</script>

<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog'
	import LargeSwitch from '$lib/builder/ui/LargeSwitch.svelte'
	import { PaneGroup, Pane, PaneResizer } from 'paneforge'
	import * as _ from 'lodash-es'
	import FullCodeEditor from './SectionEditor/FullCodeEditor.svelte'
	import ComponentPreview, { has_error } from '$lib/builder/components/ComponentPreview.svelte'
	import Fields from '$lib/builder/components/Fields/FieldsContent.svelte'
	import { locale } from '$lib/builder/stores/app/misc.js'
	import hotkey_events from '$lib/builder/stores/app/hotkey_events.js'
	import { get_content } from '$lib/builder/stores/helpers'
	import { Symbol } from '$lib/common/models/Symbol'

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
	}: { block?: Symbol; tab?: string; header?: any } = $props()

	let block = $state({} as Symbol)
	$effect.pre(() => {
		if (existing_block) {
			block = existing_block
		} else {
			block = { code: { css: '', html: '', js: '' }, fields: [], name: 'New Block' }
		}
	})

	$inspect({ block })

	let loading = false

	let component_data = $derived(get_content(block.id, block.fields)[$locale])

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
			console.log({ the_block: _.cloneDeep(block) })
			header.button.onclick(_.cloneDeep(block))
		}
	}
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
				<FullCodeEditor bind:html={block.code.html} bind:css={block.code.css} bind:js={block.code.js} data={component_data} on:save={save_component} on:mod-e={toggle_tab} />
			{:else if tab === 'content'}
				<Fields id={block.id} entity_id={block.id} fields={block.fields} />
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
