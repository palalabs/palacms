<script>
	import PageType from '$lib/builder/views/editor/PageType.svelte'
	import { compilers_registered } from '$lib/stores'

	// TODO: Load data with possibility to trigger refetch
	let data = {
		site_groups: [],
		symbol_groups: []
	}
</script>

{#if $compilers_registered}
	<PageType
		page={{
			...data.page_type,
			sections: data.sections
		}}
	/>
{/if}
