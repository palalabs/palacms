<script lang="ts">
	import { compilers_registered } from '$lib/stores'
	import PrimoPage from '$lib/builder/views/editor/Page.svelte'
	import { page as pageState } from '$app/state'
	import { Sites, Pages } from '$lib/pocketbase/collections'

	const site_id = $derived(pageState.params.site)
	const slug = $derived(pageState.params.page)
	const site = $derived(Sites.one(site_id))
	// Get page directly from collection instead of relationship
	const all_pages = $derived(Pages.list({ filter: `site = "${site_id}"` }))
	const page = $derived(all_pages.find((page) => page?.slug == slug))
</script>

{#if $compilers_registered && page}
	<PrimoPage {page} />
{/if}
