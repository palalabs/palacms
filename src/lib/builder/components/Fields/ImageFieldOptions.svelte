<script>
	import UI from '../../ui/index.js'

	let { field, oninput } = $props()

	// Initialize options object if it doesn't exist
	if (!field.options) field.options = {}

	// Set defaults if values don't exist
	if (field.options.maxSizeMB === undefined) field.options.maxSizeMB = 1
	if (field.options.maxWidthOrHeight === undefined) field.options.maxWidthOrHeight = 1920

	// Listen for changes to dispatch updates to parent
	function handle_change() {
		oninput(field.options)
	}
</script>

<div class="grid grid-cols-2 gap-2">
	<div class="option-group">
		<UI.TextInput type="number" label="Max Size (MB)" bind:value={field.options.maxSizeMB} on:input={handle_change} />
	</div>
	<div class="option-group">
		<UI.TextInput type="number" label="Max Width (px)" bind:value={field.options.maxWidthOrHeight} on:input={handle_change} />
	</div>
</div>
