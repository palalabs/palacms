<script>
	import { page } from '$app/state'
	import { ID } from '$lib/common/constants'
	import { require_site } from '$lib/loaders'
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()

	let { field, value } = $props()

	const site_id = $derived(page.params.site)
	const site = $derived(require_site(site_id))
	const selected_page_type = $site?.data.page_types.find((pt) => pt[ID] === field.options.page_type)
</script>

{#if selected_page_type}
	<div>A list of {selected_page_type.name} pages</div>
{:else}
	<div>No page connected</div>
{/if}

<style lang="postcss">
	div {
		font-size: 0.875rem;
	}
</style>
