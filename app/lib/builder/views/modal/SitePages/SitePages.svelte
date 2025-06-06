<script>
	import * as Dialog from '$lib/components/ui/dialog'
	import Item from './Item.svelte'
	import { page } from '$app/state'
	import { Sites } from '$lib/pocketbase/collections'

	const site_id = $derived(page.params.site)
	const site = $derived(Sites.one(site_id))
	const home_page = $derived(site?.homepage())
</script>

<Dialog.Header title="Pages" />
{#if home_page}
	<ul class="grid p-2 bg-[var(--primo-color-black)]">
		<li>
			<Item page={home_page} active={false} />
		</li>
		{#each home_page?.children() ?? [] as child_page}
			<li>
				<Item page={child_page} active={false} />
			</li>
		{/each}
	</ul>
{/if}
