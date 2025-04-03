<script module>
	import { writable, get } from 'svelte/store'
	const orientation = writable('horizontal')
</script>

<script lang="ts">
	import { PaneGroup, Pane, PaneResizer } from 'paneforge'
	import LargeSwitch from '../../../ui/LargeSwitch.svelte'
	import * as _ from 'lodash-es'
	import ModalHeader from '../ModalHeader.svelte'
	import FullCodeEditor from './FullCodeEditor.svelte'
	import ComponentPreview, { refresh_preview, has_error } from '$lib/builder/components/ComponentPreview.svelte'
	import Fields from '../../../components/Fields/FieldsContent.svelte'
	import { locale } from '../../../stores/app/misc.js'
	import hotkey_events from '../../../stores/app/hotkey_events.js'
	import type { Resolved } from '$lib/pocketbase/CollectionStore'
	import type { Section } from '$lib/common/models/Section'
	import { get_content } from '$lib/builder/stores/helpers'
	import { ID } from '$lib/common/constants'

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
	}: { component: Resolved<typeof Section>; tab: string; header?: any } = $props()

	let loading = false

	let component_data = $state({})
	function update_component_data() {
		component_data = get_content(component[ID], component.symbol.fields)[$locale]
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

<ModalHeader
	{...header}
	warn={() => {
		return true
	}}
	icon="lucide:blocks"
	title={component.symbol.name || 'Block'}
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
				<LargeSwitch
					tabs={[
						{
							id: 'code',
							icon: 'gravity-ui:code'
						},
						{
							id: 'content',
							icon: 'uil:edit'
						}
					]}
					bind:active_tab_id={tab}
				/>
			{/if}
		</div>
	{/snippet}
</ModalHeader>

<main lang={$locale}>
	<PaneGroup direction={$orientation} class="flex gap-1">
		<Pane defaultSize={50} class="flex flex-col">
			{#if tab === 'code'}
				<FullCodeEditor
					bind:html={component.symbol.code.html}
					bind:css={component.symbol.code.css}
					bind:js={component.symbol.code.js}
					data={_.cloneDeep(component_data)}
					on:save={save_component}
					on:mod-e={toggle_tab}
					on:mod-r={() => $refresh_preview()}
				/>
			{:else if tab === 'content'}
				<Fields id="section-{component[ID]}" entity_id={component[ID]} fields={component.symbol.fields} />
			{/if}
		</Pane>
		<PaneResizer class="PaneResizer" />
		<Pane defaultSize={50}>
			<ComponentPreview
				code={{
					html: component.symbol.code.html,
					css: component.symbol.code.css,
					js: component.symbol.code.js
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
