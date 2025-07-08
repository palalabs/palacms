<script>
	import UI from '../../ui/index.js'
	import { SiteFields } from '$lib/pocketbase/collections'

	let { field, oninput = /** @type {(val: any) => void} */ () => {} } = $props()

	// Get all site fields
	const siteFields = $derived(() => {
		const list = SiteFields.list()
		return Array.isArray(list) ? list : []
	})
	
	let field_list = $derived(() => {
		return siteFields.map(sf => ({
			id: sf.id,
			label: sf.label || sf.key,
			value: sf.id
		}))
	})
</script>

<div class="PageFieldField">
	<div class="container">
		<!-- Field select -->
		<UI.Select
			fullwidth={true}
			on:input={({ detail }) => oninput(detail)}
			label="Site Field"
			value={field.source}
			options={Array.isArray(field_list) ? field_list.map((f) => ({
				label: f.label,
				value: f.id,
				icon: undefined
			})) : []}
		/>
	</div>
</div>

<style>
	.container {
		display: grid;
	}
</style>
