<script>
	import { compilers_registered } from '$lib/stores'
	import PrimoPage from '$lib/builder/views/editor/Page.svelte'

	// TODO: Load data with possibility to trigger refetch
	let data = {
		site_groups: [],
		symbol_groups: []
	}
</script>

{#if $compilers_registered}
	<PrimoPage
		page={{
			...data.page,
			sections: data.sections
		}}
	/>
{/if}
