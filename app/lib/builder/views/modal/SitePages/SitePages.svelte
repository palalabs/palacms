<script>
	import * as Dialog from '$lib/components/ui/dialog'
	import Item from './Item.svelte'
	import { require_site } from '$lib/loaders'
	import { page } from '$app/state'

	const site_id = $derived(page.params.site)
	const site = $derived(require_site(site_id))
	const root_page = $derived($site?.data.root)
	$inspect({ $site })
</script>

<Dialog.Header title="Pages" />
<ul class="grid p-2 bg-[var(--primo-color-black)]">
	<li>
		<Item page={root_page} active={false} />
	</li>
	{#each root_page?.children as child_page}
		<li>
			<Item page={child_page} active={false} />
		</li>
	{/each}
</ul>
