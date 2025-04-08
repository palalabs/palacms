<script lang="ts">
	import { page } from '$app/state'
	import type { PageField } from '$lib/common/models/fields/PageField.js'
	import type { Id } from '$lib/common/models/Id.js'
	import { require_site } from '$lib/loaders'
	import type { Resolved } from '$lib/pocketbase/Resolved'
	import UI from '../../ui/index.js'

	const site_id = page.params.site
	const site = require_site(site_id)
	const { field }: { entity_id: Id; field: Resolved<typeof PageField> } = $props()
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
			options={$site?.data.page_types.map((page_type) => ({
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
