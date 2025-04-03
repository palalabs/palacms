<script lang="ts">
	import { compilers_registered } from '$lib/stores'
	import PrimoPage from '$lib/builder/views/editor/Page.svelte'
	import { require_site } from '$lib/loaders'
	import { page as pageState } from '$app/state'
	import type { Id } from '$lib/common/models/Id'

	const site_id = $derived(pageState.params.site as Id)
	const page_id = $derived(pageState.params.page as Id)
	const site = $derived(require_site(site_id))
	const page = $derived($site?.data.entities.pages[page_id])
</script>

{#if $compilers_registered}
	<PrimoPage {page} />
{/if}
