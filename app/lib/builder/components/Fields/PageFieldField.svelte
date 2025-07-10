<script lang="ts">
	import { page } from '$app/state'
	import { createEventDispatcher } from 'svelte'
	import type { PageFieldField } from '$lib/common/models/fields/PageFieldField.js'
	import UI from '../../ui/index.js'
	import { PageTypes, PageTypeFields } from '$lib/pocketbase/collections'

	const site_id = page.params.site
	const { field }: { entity_id: string; field: PageFieldField } = $props()

	const dispatch = createEventDispatcher()

	// Get page type fields
	const allFields = $derived.by(() => {
		const pageTypes = PageTypes.list({ filter: `site = "${site_id}"` }) || []
		console.log({ pageTypes })
		return pageTypes.flatMap((pageType) => {
			const fields = pageType.fields() || []
			return fields.map((f) => ({
				...f,
				pageTypeName: pageType.name
			}))
		})
	})

	const field_list = $derived.by(() => {
		return allFields.map((f) => ({
			id: f.id,
			label: f.label || f.key,
			value: f.id
		}))
	})

	$inspect({ allFields, field_list, fieldConfig: field.config })
</script>

<div class="PageFieldField">
	<div class="container">
		<!-- Field select -->
		<UI.Select
			fullwidth={true}
			on:input={({ detail }) => {
				dispatch('input', {
					config: {
						...field.config,
						field: detail
					}
				})
			}}
			label="Page Content"
			value={field.config?.field || (field_list.length > 0 ? field_list[0].id : '')}
			options={Array.isArray(field_list)
				? field_list.map((f) => ({
						label: f.label,
						value: f.id,
						icon: undefined
					}))
				: []}
		/>
	</div>
</div>

<style>
	.container {
		display: grid;
	}
</style>
