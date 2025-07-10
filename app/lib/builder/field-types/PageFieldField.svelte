<script lang="ts">
	import type { PageFieldField } from '$lib/common/models/fields/PageFieldField'
	import { fieldTypes } from '../stores/app'
	import { PageTypeFields } from '$lib/pocketbase/collections'
	import type { Entry } from '$lib/common/models/Entry'
	import type { Entity } from '$lib/pocketbase/content'

	import { PageEntries, PageTypeEntries } from '$lib/pocketbase/collections'

	const { entity, field, entry, onchange }: { entity: Entity; field: PageFieldField; entry?: Entry; onchange?: (value: any) => void } = $props()

	// Resolve the actual page field being referenced
	const resolvedField = $derived.by(() => {
		if (!field.config?.field) return null
		return PageTypeFields.one(field.config.field)
	})

	// Get the field type for the resolved field
	const fieldType = $derived.by(() => {
		if (!resolvedField) return null
		return $fieldTypes.find((ft) => ft.id === resolvedField.type)
	})

	// Handle changes to the page field by updating the entry
	function handleFieldChange(value: any) {
		if (!entry) {
			throw new Error(`No entry found for page field`)
		}

		// Update the entry directly
		if ('page' in entity) {
			PageEntries.update(entry.id, { value })
		} else if ('page_type' in entity) {
			PageTypeEntries.update(entry.id, { value })
		}

		// Call parent onchange if provided
		if (onchange) {
			onchange(value)
		}
	}
</script>

{#if resolvedField && fieldType && entry}
	{@const SvelteComponent = fieldType.component}
	<SvelteComponent {entity} field={{ ...resolvedField, label: field.label }} {entry} onchange={handleFieldChange} />
{:else if !field.config?.field}
	<span>Please configure this field to select a page field.</span>
{:else if !entry}
	<span>No value found for this page field.</span>
{:else}
	<span>This field has been deleted or disconnected.</span>
{/if}