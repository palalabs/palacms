<script lang="ts">
	import type { SiteFieldField } from '$lib/common/models/fields/SiteFieldField'
	import { fieldTypes } from '../stores/app'
	import { SiteFields, SiteEntries } from '$lib/pocketbase/collections'
	import type { Entry } from '$lib/common/models/Entry'
	import type { Entity } from '$lib/pocketbase/content'

	const { entity, field, entry, onchange }: { entity: Entity; field: SiteFieldField; entry?: Entry; onchange?: (value: any) => void } = $props()

	// Resolve the actual site field being referenced
	const resolvedField = $derived.by(() => {
		if (!field.config?.field) return null
		return SiteFields.one(field.config.field)
	})

	// Get the field type for the resolved field
	const fieldType = $derived.by(() => {
		if (!resolvedField) return null
		return $fieldTypes.find((ft) => ft.id === resolvedField.type)
	})

	// Handle changes to the site field by updating the entry
	function handleFieldChange(value: any) {
		if (!entry) {
			throw new Error(`No entry found for site field`)
		}

		// Update the entry directly
		SiteEntries.update(entry.id, { value })

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
	<span>Please configure this field to select a site field.</span>
{:else if !entry}
	<span>No value found for this site field.</span>
{:else}
	<span>This field has been deleted or disconnected.</span>
{/if}

<style lang="postcss">
</style>
