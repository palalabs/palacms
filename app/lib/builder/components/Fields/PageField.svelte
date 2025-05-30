<script lang="ts">
	import { page } from '$app/state'
	import { Sites } from '$lib/pocketbase/collections'
	import type { PageField } from '$lib/common/models/fields/PageField'
	import UI from '../../ui/index.js'

	const site_id = page.params.site
	const site = $derived(Sites.one(site_id))
	const { field }: { entity_id: string; field: PageField } = $props()
</script>

<div class="PagesField">
	<div class="container">
		<!-- Entity type -->
		<UI.Select
			on:input={({ detail }) => {
				field.page_type = detail
			}}
			label="Page Type"
			value={field.page_type}
			fullwidth={true}
			options={site?.page_types().map((page_type) => ({
				label: page_type.name,
				value: page_type,
				icon: page_type.icon
			}))}
		/>
	</div>
</div>

<style>
	.container {
		display: grid;
		gap: 0.5rem;
	}
</style>
