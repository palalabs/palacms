<script lang="ts">
	import * as _ from 'lodash-es'
	import { goto } from '$app/navigation'
	import { browser } from '$app/environment'
	import UI from '../../ui/index.js'
	import Icon from '@iconify/svelte'
	import { site_design_css } from '../../code_generators'
	import Sidebar_Symbol from './Sidebar_Symbol.svelte'
	import Content from '$lib/builder/components/Content.svelte'
	import { flip } from 'svelte/animate'
	import { dropTargetForElements } from '../../libraries/pragmatic-drag-and-drop/entry-point/element/adapter.js'
	import { attachClosestEdge, extractClosestEdge } from '../../libraries/pragmatic-drag-and-drop-hitbox/closest-edge.js'
	import * as Tabs from '$lib/components/ui/tabs'
	import { Cuboid, SquarePen } from 'lucide-svelte'
	import { page } from '$app/state'
	import { require_site } from '$lib/loaders'
	import { ID } from '$lib/common/constants'
	import { site_html } from '$lib/builder/stores/app/page.js'
	import modal from '$lib/builder/stores/app/modal.js'
	import type { Id } from '$lib/common/models/Id.js'

	const UPDATE_COUNTER = Symbol('UPDATE_COUNTER')

	const site_id = $derived(page.params.site as Id)
	const page_type_id = $derived(page.params.page_type as Id)
	const site = $derived(require_site(site_id))
	const page_type = $derived($site?.data.page_types.find((page_type) => page_type[ID] === page_type_id))

	// get the query param to set the tab when navigating from page (i.e. 'Edit Fields')
	let active_tab = $state(page.url.searchParams.get('t') === 'p' ? 'CONTENT' : 'BLOCKS')
	if (browser) {
		const url = new URL(page.url)
		url.searchParams.delete('t')
		goto(url, { replaceState: true })
	}

	async function create_block() {
		modal.show(
			'BLOCK_EDITOR',
			{
				header: {
					title: `Create Block'}`,
					icon: 'fas fa-check',
					button: {
						label: `Save Block`,
						icon: 'fas fa-check',
						onclick: (new_block, changes) => {
							$site?.data.symbols.push(new_block)
							modal.hide()
						}
					}
				},
				tab: 'code'
			},
			{
				showSwitch: true,
				disabledBgClose: true
			}
		)
	}

	function edit_block(block) {
		modal.show(
			'BLOCK_EDITOR',
			{
				block,
				header: {
					title: `Edit ${block.title || 'Block'}`,
					icon: 'fas fa-check',
					button: {
						label: `Save Block`,
						icon: 'fas fa-check',
						onclick: (updated_block) => {
							Object.assign(block, updated_block)
							// Force rerender for the sidebar preview
							block[UPDATE_COUNTER] = (block[UPDATE_COUNTER] ?? 0) + 1
							modal.hide()
						}
					}
				},
				tab: 'code'
			},
			{
				showSwitch: true,
				disabledBgClose: true
			}
		)
	}

	async function show_block_picker() {
		modal.show(
			'BLOCK_PICKER',
			{
				site: $site,
				append: site_design_css($site?.data.design),
				onsave: (symbols) => {
					modal.hide()
				}
			},
			{
				hideLocaleSelector: true
			}
		)
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
				if (!$site) return
				const { data } = $site
				const closestEdgeOfTarget = extractClosestEdge(self.data)
				const block_dragged_over = self.data.block
				const block_being_dragged = source.data.block
				const block_dragged_over_index = data.symbols.findIndex((symbol) => symbol[ID] === block_dragged_over[ID])
				const target_index = closestEdgeOfTarget === 'top' ? block_dragged_over_index : block_dragged_over_index + 1
				data.symbols = [
					...data.symbols.slice(0, target_index).filter((symbol) => symbol[ID] !== block_being_dragged[ID]),
					block_being_dragged,
					...data.symbols.slice(target_index).filter((symbol) => symbol[ID] !== block_being_dragged[ID])
				]
			}
		})
	}
</script>

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
			{#if Object.values($site?.data.entities.symbols ?? {}).length > 0}
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
						{#each $site?.data.symbols ?? [] as symbol (symbol[ID] + symbol[UPDATE_COUNTER])}
							{@const toggled = page_type?.symbols.some((active) => active[ID] == symbol[ID])}
							<div class="block" animate:flip={{ duration: 200 }} use:drag_target={symbol}>
								<Sidebar_Symbol
									{symbol}
									head={$site_html}
									append={site_design_css($site?.data.design)}
									show_toggle={true}
									{toggled}
									on:toggle={({ detail }) => {
										if (!page_type || detail === toggled) return // dispatches on creation for some reason
										if (toggled) {
											page_type.symbols = page_type.symbols.filter((active) => active[ID] !== symbol[ID])
										} else {
											page_type.symbols.push(symbol)
										}
									}}
									on:edit={() => edit_block(symbol)}
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
					<button class="primo--link" style="margin-bottom: 1rem" onclick={() => modal.show('PAGE_EDITOR')}>
						<Icon icon="mdi:code" />
						<span>Edit Page Type</span>
					</button>
				{/if}
				<Content minimal={true} />
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
