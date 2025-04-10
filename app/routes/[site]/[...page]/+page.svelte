<script lang="ts">
	import { compilers_registered } from '$lib/stores'
	import PrimoPage from '$lib/builder/views/editor/Page.svelte'
	import { require_site } from '$lib/loaders'
	import { page as pageState } from '$app/state'
	import type { Id } from '$lib/common/models/Id'

	const site_id = $derived(pageState.params.site as Id)
	const slug = $derived(pageState.params.page as Id)
	const site = $derived(require_site(site_id))
	const page = $derived(Object.values($site?.data.entities.pages ?? {}).find((page) => page?.slug == slug))
</script>

{#if $compilers_registered && page}
	<PrimoPage {page} />
{/if}
