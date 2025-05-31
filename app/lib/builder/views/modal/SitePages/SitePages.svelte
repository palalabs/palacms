<script>
	import * as Dialog from '$lib/components/ui/dialog'
	import Item from './Item.svelte'
	import { page } from '$app/state'
	import { Sites } from '$lib/pocketbase/collections'

	const site_id = $derived(page.params.site)
	const site = $derived(Sites.one(site_id))
	const root_page = $derived(site?.home_page())
</script>

<Dialog.Header title="Pages" />
<ul class="grid p-2 bg-[var(--primo-color-black)]">
	<li>
		<Item page={root_page} active={false} />
	</li>
	<!-- TODO: fix children -->
	{#each root_page?.children as child_page}
		<li>
			<Item page={child_page} active={false} />
		</li>
	{/each}
</ul>
