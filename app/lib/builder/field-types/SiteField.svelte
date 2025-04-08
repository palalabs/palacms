<script lang="ts">
	import { SITE } from '$lib/common/constants'
	import type { SiteFieldField } from '$lib/common/models/fields/SiteFieldField'
	import { type Id } from '$lib/common/models/Id'
	import type { Resolved } from '$lib/pocketbase/Resolved'
	import { fieldTypes } from '../stores/app'
	import { get_direct_entries } from '../stores/helpers'

	const { entity_id, field }: { entity_id: Id; field: Resolved<typeof SiteFieldField> } = $props()
	const entry = $derived(get_direct_entries(entity_id, field)[0])
	const fieldType = $derived($fieldTypes.find((ft) => ft.id === entry.value.type))
</script>

{#if entry && fieldType}
	{@const SvelteComponent = fieldType.component}
	<SvelteComponent entity_id={SITE} field={{ ...entry.value, label: field.label }} />
{:else}
	<span>This field has been deleted</span>
{/if}

<style lang="postcss">
</style>
