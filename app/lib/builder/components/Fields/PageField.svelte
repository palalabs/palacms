<script lang="ts">
	import { page } from '$app/stores'
	import { createEventDispatcher } from 'svelte'
	import { Sites } from '$lib/pocketbase/collections'
	import type { PageField } from '$lib/common/models/fields/PageField'
	import UI from '../../ui/index.js'

	const site_id = $page.params.site
	const site = $derived(Sites.one(site_id))
	const { field }: { entity_id: string; field: PageField } = $props()
	
	const dispatch = createEventDispatcher()
	
	const pageTypes = $derived.by(() => {
		const types = site?.page_types() || []
		return Array.isArray(types) ? types : []
	})
</script>

<div class="PagesField">
	<div class="container">
		<!-- Entity type -->
		<UI.Select
			on:input={({ detail }) => {
				dispatch('input', {
					config: {
						...field.config,
						page_type: detail
					}
				})
			}}
			label="Page Type"
			value={field.config?.page_type || ''}
			fullwidth={true}
			options={pageTypes.map((page_type) => ({
				label: page_type.name,
				value: page_type.id,
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
