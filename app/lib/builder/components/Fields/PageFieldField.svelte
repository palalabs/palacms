<script lang="ts">
	import { page } from '$app/state'
	import type { PageFieldField } from '$lib/common/models/fields/PageFieldField.js'
	import UI from '../../ui/index.js'

	const site_id = page.params.site
	const { field }: { entity_id: string; field: PageFieldField } = $props()
	const field_list = []
</script>

<div class="PageFieldField">
	<div class="container">
		<!-- Field select -->
		<UI.Select
			fullwidth={true}
			on:input={({ detail }) => {
				dispatch('input', detail)
			}}
			label="Page Content"
			value={field.source}
			options={field_list.map((f) => ({
				label: f.label,
				value: f.id,
				icon: undefined
			}))}
		/>
	</div>
</div>

<style>
	.container {
		display: grid;
	}
</style>
