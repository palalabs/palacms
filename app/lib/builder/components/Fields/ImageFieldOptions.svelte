<script>
	import UI from '../../ui/index.js'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	let { field } = $props()

	// Initialize config object if it doesn't exist
	if (!field.config) field.config = {}

	// Set defaults if values don't exist
	if (field.config.maxSizeMB === undefined) field.config.maxSizeMB = 1
	if (field.config.maxWidthOrHeight === undefined) field.config.maxWidthOrHeight = 1920

	// Listen for changes to dispatch updates to parent
	function handle_change() {
		dispatch('input', { config: field.config })
	}
</script>

<div class="ImageFieldOptions">
	<div class="option-group">
		<UI.TextInput type="number" label="Max Size (MB)" bind:value={field.config.maxSizeMB} on:input={handle_change} />
	</div>
	<div class="option-group">
		<UI.TextInput type="number" label="Max Dimension (px)" bind:value={field.config.maxWidthOrHeight} on:input={handle_change} />
	</div>
</div>
