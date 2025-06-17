<script module>
	import { writable, get } from 'svelte/store'
	const orientation = writable('horizontal')
</script>

<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog'
	import { PaneGroup, Pane, PaneResizer } from 'paneforge'
	import LargeSwitch from '../../../ui/LargeSwitch.svelte'
	import * as _ from 'lodash-es'
	import FullCodeEditor from './FullCodeEditor.svelte'
	import ComponentPreview, { refresh_preview, has_error } from '$lib/builder/components/ComponentPreview.svelte'
	import Fields from '../../../components/Fields/FieldsContent.svelte'
	import { locale } from '../../../stores/app/misc.js'
	import hotkey_events from '../../../stores/app/hotkey_events.js'
	import { getContent } from '$lib/pocketbase/content'
	import { PageSections, SiteSymbols } from '$lib/pocketbase/collections'
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

	const symbol = $derived(SiteSymbols.one(component.symbol))

	let loading = false

	let component_data = $state({})
	function update_component_data() {
		if (!symbol) {
			return
		}
		component_data = getContent(component, symbol.fields())[$locale]
	}
	$effect.pre(() => {
		update_component_data()
	})

	hotkey_events.on('e', toggle_tab)

	function toggle_tab() {
		tab = tab === 'code' ? 'content' : 'code'
	}

	async function save_component() {
		// if (!$preview_updated) {
		// 	await refresh_preview()
		// }

		if (!$has_error) {
			header.button.onclick()
		}
	}
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
					bind:html={symbol.html}
					bind:css={symbol.css}
					bind:js={symbol.js}
					data={_.cloneDeep(component_data)}
					on:save={save_component}
					on:mod-e={toggle_tab}
					on:mod-r={() => $refresh_preview()}
				/>
			{:else if tab === 'content'}
				<Fields id="section-{component.id}" entity_id={component.id} fields={symbol.fields()} />
			{/if}
		</Pane>
		<PaneResizer class="PaneResizer" />
		<Pane defaultSize={50}>
			<ComponentPreview
				code={{
					html: symbol.html,
					css: symbol.css,
					js: symbol.js
				}}
				data={_.cloneDeep(component_data)}
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
