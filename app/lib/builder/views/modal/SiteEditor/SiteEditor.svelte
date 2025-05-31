<script>
	import * as Dialog from '$lib/components/ui/dialog'
	import Icon from '@iconify/svelte'
	import { PaneGroup, Pane, PaneResizer } from 'paneforge'
	import Fields from '$lib/builder/components/Fields/FieldsContent.svelte'
	import * as _ from 'lodash-es'
	import CodeEditor from '$lib/builder/components/CodeEditor/CodeMirror.svelte'
	import { setContext } from 'svelte'
	import { page } from '$app/state'
	import { Sites } from '$lib/pocketbase/collections'

	const site_id = page.params.site
	const site = $derived(Sites.one(site_id))

	setContext('hide_dynamic_field_types', true)

	let disableSave = false

	async function saveComponent() {
		// TODO: Implement
		throw new Error('Not implemented')
	}
</script>

<Dialog.Header
	title="Site"
	button={{
		label: 'Save',
		onclick: saveComponent,
		disabled: disableSave
	}}
/>

{#if site}
	<main class="SiteEditor">
		<!-- TODO: $userRole === 'DEV' -->
		{#if true}
			<PaneGroup direction="horizontal" style="display: flex;">
				<Pane defaultSize={50}>
					<Fields id="site-{site.id}" fields={site.site_fields()} />
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
								<CodeEditor mode="html" bind:value={site.head} on:save={saveComponent} />
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
								<CodeEditor mode="html" bind:value={site.foot} on:save={saveComponent} />
							</div>
						</Pane>
					</PaneGroup>
				</Pane>
			</PaneGroup>
		{:else}
			<!-- <Fields id="site-{site.id}" fields={site.data.fields} /> -->
		{/if}
	</main>
{/if}

<style lang="postcss">
	.SiteEditor {
	}
	main {
		display: flex; /* to help w/ positioning child items in code view */
		background: var(--primo-color-black);
		color: var(--color-gray-2);
		padding: 0.5rem;
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
