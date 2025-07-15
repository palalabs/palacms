<script>
	import * as Dialog from '$lib/components/ui/dialog'
	import Icon from '@iconify/svelte'
	import { PaneGroup, Pane, PaneResizer } from 'paneforge'
	import Fields from '$lib/builder/components/Fields/FieldsContent.svelte'
	import * as _ from 'lodash-es'
	import CodeEditor from '$lib/builder/components/CodeEditor/CodeMirror.svelte'
	import { setContext } from 'svelte'
	import { page } from '$app/state'
	import { Sites, SiteFields, SiteEntries } from '$lib/pocketbase/collections'
	import { batchCommitWithDependencies } from '$lib/pocketbase/batchCommit'

	let { onClose } = $props()

	const host = $derived(page.url.host)
	const site = $derived(Sites.list({ filter: `host = "${host}"` })?.[0])
	const fields = $derived(site?.fields() ?? [])
	const entries = $derived(site?.entries() ?? [])

	setContext('hide_dynamic_field_types', true)

	let head = $state('')
	let foot = $state('')
	$effect.pre(() => {
		if (site) {
			head = site.head
			foot = site.foot
		}
	})

	let disableSave = $state(false)

	async function saveComponent() {
		if (!site) {
			return
		}

		disableSave = true
		try {
			Sites.update(site.id, {
				head,
				foot
			})
			
			// Use batch commit to handle dependencies properly
			await batchCommitWithDependencies([
				{ name: 'Sites', collection: Sites },
				{ name: 'SiteFields', collection: SiteFields, dependsOn: ['Sites'] },
				{ name: 'SiteEntries', collection: SiteEntries, dependsOn: ['SiteFields'] }
			])
			
			console.log('Site saved successfully')
			if (onClose) onClose()
		} catch (error) {
			console.error('Error saving site:', error)
			throw error
		} finally {
			disableSave = false
		}
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
					<Fields
						entity={site}
						{fields}
						{entries}
						create_field={async (parentId) => {
							// If this is a child field, commit parent fields first
							if (parentId) {
								try {
									await SiteFields.commit()
								} catch (error) {
									console.warn('Failed to commit parent fields:', error)
								}
							}
							
							return SiteFields.create({
								type: 'text',
								key: '',
								label: '',
								config: null,
								site: site.id,
								parent: parentId || ''
							})
						}}
						oninput={(values) => {
							for (const [key, value] of Object.entries(values)) {
								const field = fields?.find((field) => field.key === key)
								if (!field) {
									continue
								}

								const entry = entries?.find((entry) => entry.field === field?.id)
								if (entry) {
									SiteEntries.update(entry.id, { value })
								} else {
									SiteEntries.create({ field: field.id, locale: 'en', value })
								}
							}
						}}
						onchange={({ id, data }) => {
							SiteFields.update(id, data)
						}}
						ondelete={(field_id) => {
							// PocketBase cascade deletion will automatically clean up all associated entries
							SiteFields.delete(field_id)
						}}
						onadd={({ parent, index, subfields }) => {
							// Create an entry for the repeater item
							SiteEntries.create({
								field: parent,
								locale: 'en',
								value: {}
							})
						}}
					/>
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
								<CodeEditor mode="html" bind:value={head} on:save={saveComponent} />
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
								<CodeEditor mode="html" bind:value={foot} on:save={saveComponent} />
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
