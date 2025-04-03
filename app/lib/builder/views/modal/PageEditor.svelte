<script lang="ts">
	import Icon from '@iconify/svelte'
	import { PaneGroup, Pane, PaneResizer } from 'paneforge'
	import Fields from '$lib/builder/components/Fields/FieldsContent.svelte'
	import * as _ from 'lodash-es'
	import ModalHeader from './ModalHeader.svelte'
	import CodeEditor from '$lib/builder/components/CodeEditor/CodeMirror.svelte'
	import { page } from '$app/state'
	import { require_site } from '$lib/loaders'
	import type { Id } from '$lib/common/models/Id'
	import { ID } from '$lib/common/constants'

	const site_id = page.params.site
	const page_type_id = page.params.page_type as Id
	const site = require_site(site_id)
	const page_type = $derived($site?.data.entities.page_types[page_type_id])

	let disableSave = false

	async function saveComponent() {
		// TODO: Implement
		throw new Error('Not implemented')
	}
</script>

{#if page_type}
	<ModalHeader
		icon={page_type.icon}
		title={page_type.name}
		warn={() => {
			return true
		}}
		button={{
			icon: 'material-symbols:save',
			label: 'Save',
			disabled: disableSave
		}}
	/>

	<main class="SiteEditor">
		<PaneGroup direction="horizontal" style="display: flex;">
			<Pane defaultSize={50}>
				<Fields id="page-type-{page_type[ID]}" entity_id={page_type[ID]} fields={page_type.fields} />
			</Pane>
			<PaneResizer class="PaneResizer-primary">
				<div class="icon primary">
					<Icon icon="mdi:drag-vertical-variant" />
				</div>
			</PaneResizer>
			<Pane defaultSize={50}>
				<PaneGroup direction="vertical">
					<Pane>
						<div class="container" style="margin-bottom: 1rem">
							<span class="primo--field-label">Head</span>
							<CodeEditor mode="html" bind:value={page_type.code.head} on:save={saveComponent} />
						</div>
					</Pane>
					<PaneResizer class="PaneResizer-secondary">
						<div class="icon secondary">
							<Icon icon="mdi:drag-horizontal-variant" />
						</div>
					</PaneResizer>
					<Pane>
						<div class="container">
							<span class="primo--field-label">Foot</span>
							<CodeEditor mode="html" bind:value={page_type.code.foot} on:save={saveComponent} />
						</div>
					</Pane>
				</PaneGroup>
			</Pane>
		</PaneGroup>
	</main>
{/if}

<style lang="postcss">
	.SiteEditor {
	}
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

	:global(.PaneResizer-primary) {
		height: 100%;
		width: 3px;
		background: var(--color-gray-9);
		display: grid;
		place-content: center;
	}
	:global(.PaneResizer-secondary) {
		width: 100%;
		display: grid;
		place-content: center;
		justify-content: center;
		height: 2px;
		background: var(--color-gray-8);
		margin-block: 0.5rem;
	}
	.icon {
		position: relative;
		background: var(--color-gray-8);
		border-radius: 2px;
		color: var(--color-gray-3);

		&.primary {
			padding-block: 3px;
		}

		&.secondary {
			padding-inline: 3px;
		}
	}
	.container {
		padding-left: 0.75rem;
		display: flex;
		flex-direction: column;
		max-height: 100%;
	}
</style>
