<script>
	import { page } from '$app/state'
	import { createEventDispatcher } from 'svelte'
	import { Sites } from '$lib/pocketbase/collections'
	const dispatch = createEventDispatcher()

	let { field, value } = $props()

	const site_id = $derived(page.params.site)
	const site = $derived(Sites.one(site_id))
	const selected_page_type = $site?.data.page_types.find((pt) => pt.id === field.options.page_type)
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
