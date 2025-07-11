<script lang="ts">
	import { flip } from 'svelte/animate'
	import * as _ from 'lodash-es'
	import UI from '$lib/builder/ui'
	import { dragging_symbol } from '$lib/builder/stores/app/misc'
	import Sidebar_Symbol from './Sidebar_Symbol.svelte'
	import Content from '../Content.svelte'
	import { browser } from '$app/environment'
	import { goto } from '$app/navigation'
	import { dropTargetForElements } from '$lib/builder/libraries/pragmatic-drag-and-drop/entry-point/element/adapter.js'
	import { attachClosestEdge, extractClosestEdge } from '$lib/builder/libraries/pragmatic-drag-and-drop-hitbox/closest-edge.js'
	import { site_html } from '$lib/builder/stores/app/page'
	import * as Tabs from '$lib/components/ui/tabs'
	import { Cuboid, SquarePen } from 'lucide-svelte'
	import { page as pageState } from '$app/state'
	import { PageTypes, Sites, Pages, PageEntries } from '$lib/pocketbase/collections'
	import { SiteSymbols } from '$lib/pocketbase/collections'

	let active_tab = $state((browser && localStorage.getItem('page-tab')) || 'BLOCKS')

	const host = $derived(pageState.url.host)
	const site = $derived(Sites.list({ filter: `host = "${host}"` })?.[0])
	const slug = $derived(pageState.params.page)
	const page = $derived(site && slug ? Pages.list({ filter: `site = "${site.id}" && slug = "${slug}"` })?.[0] : site?.homepage())
	const page_type = $derived(page && PageTypes.one(page.page_type))
	const page_type_fields = $derived(page_type?.fields())
	const page_entries = $derived(page?.entries())
	const page_type_symbols = $derived(page_type?.symbols() ?? [])
	const has_symbols = $derived(!!page_type_symbols?.length)

	$effect(() => {
		if (!has_symbols) active_tab = 'CONTENT'
		else active_tab = 'BLOCKS'
	})

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
			onDragStart() {
				$dragging_symbol = true
			},
			onDragEnd() {
				$dragging_symbol = false
			},
			onDrop({ self, source }) {
				$dragging_symbol = false
				const closestEdgeOfTarget = extractClosestEdge(self.data)
				if (closestEdgeOfTarget === 'top') {
					// TODO: Implement
					throw new Error('Not implemented')
				} else if (closestEdgeOfTarget === 'bottom') {
					// TODO: Implement
					throw new Error('Not implemented')
				}
			}
		})
	}

	let commit_task = $state<NodeJS.Timeout>()
</script>

<div class="sidebar primo-reset">
	{#if has_symbols}
		<Tabs.Root value="blocks" class="p-2">
			<Tabs.List class="w-full mb-2">
				<Tabs.Trigger value="blocks" class="flex-1 flex gap-1">
					<Cuboid class="w-3" />
					<span class="text-xs">Blocks</span>
				</Tabs.Trigger>
				<Tabs.Trigger value="content" class="flex-1 flex gap-1">
					<SquarePen class="w-3" />
					<span class="text-xs">Content</span>
				</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="blocks">
				<div class="symbols">
					{#if site_html !== null}
						{#each page_type_symbols ?? [] as symbol (symbol.id)}
							<div animate:flip={{ duration: 200 }} use:drag_target={symbol}>
								{#await SiteSymbols.one(symbol.symbol) then newsymbol}
									{#if newsymbol}
										<Sidebar_Symbol symbol={newsymbol} controls_enabled={false} head={site_html} />
									{/if}
								{/await}
							</div>
						{/each}
					{:else}
						<div style="display: flex;justify-content: center;font-size: 2rem;color:var(--color-gray-6)">
							<UI.Spinner variant="loop" />
						</div>
					{/if}
				</div>
				<!-- $userRole === 'DEV' -->
				{#if true}
					<button onclick={() => goto(`/${site?.id}/page-type--${page_type?.id}?t=b`)} class="footer-link">Manage Blocks</button>
				{/if}
			</Tabs.Content>
			<Tabs.Content value="content">
				{#if page && page_type_fields && page_entries}
					<div class="page-type-fields">
						<Content
							entity={page}
							fields={page_type_fields}
							entries={page_entries}
							oninput={(values) => {
								for (const [key, value] of Object.entries(values)) {
									const field = page_type_fields?.find((field) => field.key === key)
									if (!field) {
										continue
									}

									const entry = page_entries?.find((entry) => entry.field === field?.id)
									if (entry) {
										PageEntries.update(entry.id, { value })
									} else {
										PageEntries.create({ page: page.id, field: field.id, locale: 'en', value })
									}
								}

								clearTimeout(commit_task)
								commit_task = setTimeout(() => PageEntries.commit(), 500)
							}}
						/>
					</div>
				{/if}
				<!-- $userRole === 'DEV' -->
				{#if true}
					<button onclick={() => goto(`/${site?.id}/page-type--${page_type?.id}?t=p`)} class="footer-link">Manage Fields</button>
				{/if}
			</Tabs.Content>
		</Tabs.Root>
	{:else}
		{#if page && page_type_fields && page_entries}
			<div class="p-4 page-type-fields">
				<Content
					entity={page}
					fields={page_type_fields}
					entries={page_entries}
					oninput={(values) => {
						for (const [key, value] of Object.entries(values)) {
							const field = page_type_fields?.find((field) => field.key === key)
							if (!field) {
								continue
							}

							const entry = page_entries?.find((entry) => entry.field === field?.id)
							if (entry) {
								PageEntries.update(entry.id, { value })
							} else {
								PageEntries.create({ page: page.id, field: field.id, locale: 'en', value })
							}
						}

						clearTimeout(commit_task)
						commit_task = setTimeout(() => PageEntries.commit(), 500)
					}}
				/>
			</div>
		{/if}
		<!-- $userRole === 'DEV' -->
		{#if true}
			<button onclick={() => goto(`/admin/site/page-type--${page_type?.id}?t=p`)} class="footer-link mb-2 mr-2">Manage Fields</button>
		{/if}
	{/if}
</div>

<style lang="postcss">
	.sidebar {
		width: 100%;
		/* background: #171717; */
		background: #111;
		z-index: 9;
		display: flex;
		flex-direction: column;
		height: 100%;
		flex: 1;
		/* gap: 0.5rem; */
		z-index: 9;
		position: relative;
		overflow: auto;
		/* padding-top: 0.5rem; */
	}

	.container {
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		padding: 1rem;
		height: 100%;
		gap: 1rem;
	}

	.page-type-fields {
		flex: 1;
	}

	.symbols {
		gap: 1rem;
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	button.footer-link {
		font-size: 0.625rem;
		text-align: right;
		text-decoration: underline;
		color: var(--color-gray-4);
	}
</style>
