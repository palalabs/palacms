<script>
	import pages from '../stores/data/pages.js'
	import UI from '../ui/index.js'

	const { field, value, oninput = /** @type {(val: string) => void} */ () => {} } = $props()

	const selectable_pages = $derived($pages.filter((p) => p.page_type === field.options.page_type))
</script>

<div>
	<UI.Select
		label={field.label}
		{value}
		options={selectable_pages.map((page) => ({
			value: page.id,
			label: page.name
		}))}
		on:input={({ detail }) => {
			oninput({ value: detail })
		}}
		fullwidth={true}
	/>
</div>

<style lang="postcss">
	div {
		width: 100%;
	}
</style>
