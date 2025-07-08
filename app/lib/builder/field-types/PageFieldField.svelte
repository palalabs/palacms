<script lang="ts">
	import type { PageFieldField } from '$lib/common/models/fields/PageFieldField'
	import { getDirectEntries, type Entity } from '$lib/pocketbase/content'
	import { fieldTypes } from '../stores/app'
	import { PageTypeFields } from '$lib/pocketbase/collections'

	const { entity, field, entries = [] }: { entity: Entity; field: PageFieldField; entries?: any[] } = $props()

	// Resolve the actual page field being referenced
	const resolvedField = $derived.by(() => {
		if (!field.config?.field) return null
		return PageTypeFields.one(field.config.field)
	})

	// Get the entry for the resolved field from the current page's entries
	const resolvedEntry = $derived.by(() => {
		if (!resolvedField) return undefined
		return getDirectEntries(entity, resolvedField, entries)
	})

	// Get the field type for the resolved field
	const fieldType = $derived.by(() => {
		if (!resolvedField) return null
		return $fieldTypes.find((ft) => ft.id === resolvedField.type)
	})

	$inspect({ fieldConfig: field.config, resolvedField, fieldType, resolvedEntry })
</script>

{#if resolvedField && fieldType}
	{@const SvelteComponent = fieldType.component}
	<SvelteComponent {entity} field={{ ...resolvedField, label: field.label }} entry={resolvedEntry} />
{:else if !field.config?.field}
	<span>Please configure this field to select a page field.</span>
{:else}
	<span>This field has been deleted or disconnected.</span>
{/if}

<style>
</style>
