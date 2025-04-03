<script>
	import UI from '../../ui/index.js'

	let { field, oninput = /** @type {(val: any) => void} */ () => {} } = $props()

	// fetch fields for site and current page
	let field_list = []
</script>

<div class="PageFieldField">
	<div class="container">
		<!-- Field select -->
		<UI.Select
			fullwidth={true}
			on:input={({ detail }) => oninput(detail)}
			label="Site Field"
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
