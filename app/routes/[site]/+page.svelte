<script lang="ts">
	import { compilers_registered } from '$lib/stores'
	import PrimoPage from '$lib/builder/views/editor/Page.svelte'
	import { page as pageState } from '$app/state'
	import { Sites, Pages } from '$lib/pocketbase/collections'

	const site_id = $derived(pageState.params.site)
	const site = $derived(Sites.one(site_id))
	const page = $derived(site?.homepage())
</script>

{#if $compilers_registered && page}
	<PrimoPage {page} />
{/if}
