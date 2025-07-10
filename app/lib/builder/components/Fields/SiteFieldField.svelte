<script>
	import { page } from '$app/state'
	import { createEventDispatcher } from 'svelte'
	import UI from '../../ui/index.js'
	import { SiteFields } from '$lib/pocketbase/collections'

	const site_id = page.params.site
	let { field } = $props()

	const dispatch = createEventDispatcher()

	// Get site fields for the current site
	const siteFields = $derived.by(() => {
		const list = SiteFields.list({ filter: `site = "${site_id}"` })
		return Array.isArray(list) ? list : []
	})

	let field_list = $derived.by(() => {
		return siteFields.map((sf) => ({
			id: sf.id,
			label: sf.label || sf.key,
			value: sf.id
		}))
	})

	$inspect({ siteFields, field_list })
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
			label="Site Content"
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
