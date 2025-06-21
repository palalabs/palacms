<script>
	import * as Dialog from '$lib/components/ui/dialog'
	import Item from './Item.svelte'
	import { page } from '$app/state'
	import { Sites, Pages } from '$lib/pocketbase/collections'

	const site_id = $derived(page.params.site)
	const site = $derived(Sites.one(site_id))
	// Get all pages and filter in JS since PocketBase filter isn't working
	const all_pages = $derived(Pages.list())
	const site_pages = $derived(all_pages.filter((p) => p.site === site_id))
	const home_page = $derived(site_pages.find((p) => p.parent === '' || !p.parent))
	const child_pages = $derived(site_pages.filter((p) => p.parent === home_page?.id))
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
{/if}
