<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog'
	import * as _ from 'lodash-es'
	import { goto } from '$app/navigation'
	import { browser } from '$app/environment'
	import UI from '../../ui/index.js'
	// Icon component removed to prevent stack overflow issues
	import Icon from '@iconify/svelte'
	import BlockEditor from '$lib/builder/views/modal/BlockEditor.svelte'
	import BlockPicker from '$lib/builder/views/modal/BlockPicker.svelte'
	import PageEditor from '$lib/builder/views/modal/PageEditor.svelte'
	import Sidebar_Symbol from './Sidebar_Symbol.svelte'
	import Content from '$lib/builder/components/Content.svelte'
	import { flip } from 'svelte/animate'
	import { dropTargetForElements } from '../../libraries/pragmatic-drag-and-drop/entry-point/element/adapter.js'
	import { attachClosestEdge, extractClosestEdge } from '../../libraries/pragmatic-drag-and-drop-hitbox/closest-edge.js'
	import * as Tabs from '$lib/components/ui/tabs'
	import { Cuboid, SquarePen } from 'lucide-svelte'
	import { page } from '$app/state'
	import { Sites, PageTypes, SiteSymbols, PageTypeSymbols, SiteSymbolFields, SiteSymbolEntries, PageTypeFields, PageTypeEntries } from '$lib/pocketbase/collections'
	import { site_html } from '$lib/builder/stores/app/page.js'

	const site_id = $derived(page.params.site)
	const page_type_id = $derived(page.params.page_type)
	const site = $derived(Sites.one(site_id))
	const page_type = $derived(PageTypes.one(page_type_id))
	const fields = $derived(page_type?.fields() ?? [])
	const entries = $derived(page_type?.entries() ?? [])
	const page_type_symbols = $derived(page_type?.symbols() ?? [])
	const site_symbols = $derived(site?.symbols() ?? [])

	// get the query param to set the tab when navigating from page (i.e. 'Edit Fields')
	let active_tab = $state(page.url.searchParams.get('t') === 'p' ? 'CONTENT' : 'BLOCKS')
	if (browser) {
		const url = new URL(page.url)
		url.searchParams.delete('t')
		goto(url, { replaceState: true })
	}

	async function create_block() {
		creating_block = true
	}

	let active_block_id = $state(null)
	let active_block = $state(null)

	function edit_block(block, block_id) {
		active_block = block
		active_block_id = block_id
		editing_block = true
	}

	async function show_block_picker() {
		adding_block = true
	}

	function drag_target(element, block) {
		dropTargetForElements({
			element,
			getData({ input, element }) {
				return attachClosestEdge(
					{ block },
					{
						element,
						input,
						allowedEdges: ['top', 'bottom']
					}
				)
			},
			onDrop({ self, source }) {
				if (!site) return
				const closestEdgeOfTarget = extractClosestEdge(self.data)
				const block_dragged_over = self.data.block
				const block_being_dragged = source.data.block
				const block_dragged_over_index = SiteSymbols.list().findIndex((symbol) => symbol.id === block_dragged_over.id)
				const target_index = closestEdgeOfTarget === 'top' ? block_dragged_over_index : block_dragged_over_index + 1
				// TODO: reconfigure
				// data.symbols = [
				// 	...data.symbols.slice(0, target_index).filter((symbol) => symbol.id !== block_being_dragged.id),
				// 	block_being_dragged,
				// 	...data.symbols.slice(target_index).filter((symbol) => symbol.id !== block_being_dragged.id)
				// ]
			}
		})
	}

	let editing_block = $state(false)
	let creating_block = $state(false)
	let adding_block = $state(false)
	let editing_page = $state(false)

	$effect(() => {
		if (!editing_block && !creating_block) {
			SiteSymbols.discard()
			SiteSymbolFields.discard()
			SiteSymbolEntries.discard()
		}
	})

	$effect(() => {
		if (!editing_page) {
			PageTypes.discard()
			PageTypeFields.discard()
			PageTypeEntries.discard()
		}
	})

	let commit_task = $state<NodeJS.Timeout>()
</script>

<Dialog.Root bind:open={editing_block}>
	<Dialog.Content class="z-[999] max-w-[1600px] h-full max-h-[100vh] flex flex-col p-4">
		<BlockEditor
			block={active_block}
			header={{
				title: `Edit ${active_block?.title || 'Block'}`,
				button: {
					label: 'Save',
					onclick: () => {
						editing_block = false
						active_block_id = null
					}
				}
			}}
		/>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={creating_block}>
	<Dialog.Content class="z-[999] max-w-[1600px] h-full max-h-[100vh] flex flex-col p-4">
		<BlockEditor
			header={{
				button: {
					label: 'Create Block',
					onclick: () => {
						creating_block = false
					}
				}
			}}
		/>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={adding_block}>
	<Dialog.Content class="z-[999] max-w-[1600px] h-full max-h-[100vh] flex flex-col p-4">
		<BlockPicker
			{site}
			onsave={(blocks) => {
				console.log({ blocks })
				// TODO: add blocks to site
				adding_block = false
			}}
		/>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={editing_page}>
	<Dialog.Content class="z-[999] max-w-[1600px] h-full max-h-[100vh] flex flex-col p-4">
		<PageEditor onClose={() => (editing_page = false)} />
	</Dialog.Content>
</Dialog.Root>

<div class="sidebar primo-reset">
	<Tabs.Root value="blocks" class="p-2">
		<Tabs.List class="w-full mb-2">
			<Tabs.Trigger value="blocks" class="flex-1 flex gap-1">
				<Cuboid class="w-3" />
				<!-- <span class="text-xs">Page Blocks</span> -->
			</Tabs.Trigger>
			<Tabs.Trigger value="content" class="flex-1 flex gap-1">
				<SquarePen class="w-3" />
				<!-- <span class="text-xs">Page Content</span> -->
			</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="blocks" class="px-1">
			{#if site_symbols.length > 0}
				<div class="primo-buttons">
					<button class="primo-button" onclick={show_block_picker}>
						<Icon icon="mdi:plus" />
						<span>Add</span>
					</button>
					<!-- $userRole === 'DEV' -->
					{#if true}
						<button class="primo-button" onclick={create_block}>
							<Icon icon="mdi:code" />
							<span>Create</span>
						</button>
					{/if}
					<!-- <label class="primo-button">
						<input onchange={upload_block} type="file" accept=".json" />
						<Icon icon="mdi:upload" />
						<span>Upload</span>
					</label> -->
				</div>
				{#if $site_html !== null}
					<div class="block-list">
						{#each site_symbols as symbol (symbol.id)}
							{@const relation = page_type_symbols.find((relation) => relation.symbol === symbol.id)}
							{@const toggled = !!relation}
							<div class="block" animate:flip={{ duration: 200 }} use:drag_target={symbol}>
								<Sidebar_Symbol
									{symbol}
									head={$site_html}
									show_toggle={true}
									{toggled}
									on:toggle={({ detail }) => {
										if (!page_type || detail === toggled) return // dispatches on creation for some reason
										if (toggled) {
											PageTypeSymbols.delete(relation.id)
											PageTypeSymbols.commit()
										} else {
											PageTypeSymbols.create({ page_type: page_type.id, symbol: symbol.id })
											PageTypeSymbols.commit()
										}
									}}
									on:edit={() => edit_block(symbol, symbol.id)}
									on:delete={() => {
										SiteSymbols.delete(symbol.id)
										SiteSymbols.commit()
									}}
								/>
							</div>
						{/each}
					</div>
				{:else}
					<div style="display: flex;justify-content: center;font-size: 2rem;color:var(--color-gray-6)">
						<UI.Spinner variant="loop" />
					</div>
				{/if}
			{:else}
				<div class="empty">Add a Block to your site to use it on your pages.</div>
				<div class="primo-buttons">
					<button class="primo-button" onclick={show_block_picker}>
						<Icon icon="mdi:plus" />
						<span>Add</span>
					</button>
					<button class="primo-button" onclick={create_block}>
						<Icon icon="mdi:code" />
						<span>Create</span>
					</button>
					<label class="primo-button">
						<input onchange={upload_block} type="file" accept=".json" />
						<Icon icon="mdi:upload" />
						<span>Upload</span>
					</label>
				</div>
			{/if}
		</Tabs.Content>
		<Tabs.Content value="content" class="px-1">
			<div class="page-type-fields">
				<!-- $userRole === 'DEV' -->
				{#if true}
					<!-- <button class="primo--link" style="margin-bottom: 1rem" onclick={() => modal.show('PAGE_EDITOR')}> -->
					<button class="primo--link" style="margin-bottom: 1rem" onclick={() => (editing_page = true)}>
						<Icon icon="mdi:code" />
						<span>Edit Page Type</span>
					</button>
				{/if}
				{#if page_type}
					<Content
						entity={page_type}
						{fields}
						{entries}
						oninput={(values) => {
							for (const [key, value] of Object.entries(values)) {
								const field = fields?.find((field) => field.key === key)
								if (!field) {
									continue
								}

								const entry = entries?.find((entry) => entry.field === field?.id)
								if (entry) {
									PageTypeEntries.update(entry.id, { value })
								} else {
									PageTypeEntries.create({ field: field.id, locale: 'en', value })
								}
							}

							clearTimeout(commit_task)
							commit_task = setTimeout(() => PageTypeEntries.commit(), 500)
						}}
					/>
				{/if}
			</div>
		</Tabs.Content>
	</Tabs.Root>
</div>

<style lang="postcss">
	.sidebar {
		width: 100%;
		background: #111;
		z-index: 9;
		display: flex;
		flex-direction: column;
		height: calc(100vh - 59px);
		/* height: 100%; */
		/* gap: 0.5rem; */
		z-index: 9;
		position: relative;
		overflow: auto;
		/* overflow: hidden; */
		/* padding-top: 0.5rem; */
	}

	.empty {
		font-size: 0.75rem;
		color: var(--color-gray-2);
		padding-bottom: 0.25rem;
	}

	.primo-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.primo-button {
		padding: 0.25rem 0.5rem;
		/* color: #b6b6b6;
			background: #292929; */
		color: var(--color-gray-2);
		background: var(--color-gray-8);
		border-radius: 4px;
		cursor: pointer;
		display: flex;
		gap: 0.25rem;
		align-items: center;
		font-size: 0.75rem;

		input {
			display: none;
		}
	}

	.container {
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		padding: 1rem;
		gap: 0.75rem;
	}

	.block-list {
		/* gap: 1rem; */
		flex: 1;
		display: flex;
		flex-direction: column;

		.block {
			padding-block: 0.5rem;
		}

		.block:first-child {
			padding-top: 0;
		}
	}
</style>
