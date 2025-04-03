<script lang="ts">
	import { ID } from '$lib/common/constants'
	import type { PageFieldField } from '$lib/common/models/fields/PageFieldField'
	import type { Id } from '$lib/common/models/Id'
	import type { Resolved } from '$lib/pocketbase/CollectionStore'
	import { fieldTypes } from '../stores/app'
	import { get_direct_entries } from '../stores/helpers'

	const { entity_id, field }: { entity_id: Id; field: Resolved<typeof PageFieldField> } = $props()
	const entry = $derived(get_direct_entries(entity_id, field)[0])
	const fieldType = $derived($fieldTypes.find((ft) => ft.id === entry.value.field.type))
</script>

{#if entry && fieldType}
	{@const SvelteComponent = fieldType.component}
	<SvelteComponent entity_id={entry.value.page[ID]} field={{ ...entry.value.field, label: field.label }} />
{:else}
	<span>This field has been deleted or disconnected.</span>
{/if}

<style>
</style>
