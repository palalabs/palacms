<script lang="ts">
	import { page } from '$app/state'
	import { createEventDispatcher } from 'svelte'
	import type { PageFieldField } from '$lib/common/models/fields/PageFieldField.js'
	import UI from '../../ui/index.js'
	import { PageTypes, SiteSymbolFields } from '$lib/pocketbase/collections'

	const site_id = page.params.site
	const { field }: { entity_id: string; field: PageFieldField } = $props()
	
	const dispatch = createEventDispatcher()

	// Get all page types and their fields
	const pageTypes = $derived(PageTypes.list() || [])
	const allFields = $derived(() => {
		return pageTypes.flatMap(pageType => {
			const symbols = pageType.symbols() || []
			return symbols.flatMap(symbol => {
				const fields = symbol.fields() || []
				return fields.map(f => ({
					...f,
					pageTypeName: pageType.name,
					symbolName: symbol.name
				}))
			})
		})
	})
	
	const field_list = $derived(allFields.map(f => ({
		id: f.id,
		label: `${f.pageTypeName} → ${f.symbolName} → ${f.label || f.key}`,
		value: f.id
	})))
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
