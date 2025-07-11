<script>
	import * as Dialog from '$lib/components/ui/dialog'
	import Item from './Item.svelte'
	import PageForm from './PageForm.svelte'
	import Icon from '@iconify/svelte'
	import { page } from '$app/state'
	import { Sites, Pages } from '$lib/pocketbase/collections'

	const host = $derived(page.url.host)
	const site = $derived(Sites.list({ filter: `host = "${host}"` })?.[0])
	const all_pages = $derived(site?.pages() ?? [])
	const home_page = $derived(site?.homepage())
	const child_pages = $derived(home_page?.children() ?? [])

	let creating_page = $state(false)
</script>

<Dialog.Header title="Pages" />
{#if home_page}
	<ul class="grid p-2 bg-[var(--primo-color-black)]">
		<li>
			<Item page={home_page} active={false} />
		</li>
		{#each child_pages as child_page}
			<li>
				<Item page={child_page} active={false} />
			</li>
		{/each}
	</ul>

	{#if creating_page}
		<div class="p-2 pt-0 bg-[var(--primo-color-black)]">
			<PageForm
				on:create={async ({ detail: new_page }) => {
					creating_page = false
					const url_taken = all_pages.some((page) => page?.slug === new_page.slug)
					if (url_taken) {
						alert(`That URL is already in use`)
					} else {
						Pages.create({ ...new_page, parent: home_page.id, site: site.id })
						Pages.commit()
					}
				}}
			/>
		</div>
	{:else}
		<div class="p-2 pt-0 bg-[var(--primo-color-black)]">
			<button class="create-page-btn" onclick={() => (creating_page = true)}>
				<Icon icon="akar-icons:plus" />
				<span>Create Page</span>
			</button>
		</div>
	{/if}
{/if}

<style lang="postcss">
	.create-page-btn {
		width: 100%;
		padding: 0.875rem 1.125rem;
		background: #1a1a1a;
		border-radius: var(--primo-border-radius);
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		align-items: center;
		transition: 0.1s;
		color: var(--color-gray-3);

		&:hover {
			border-color: var(--weave-primary-color);
			color: var(--weave-primary-color);
		}
	}
</style>
