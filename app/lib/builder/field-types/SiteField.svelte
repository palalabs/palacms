<script lang="ts">
	import type { SiteFieldField } from '$lib/common/models/fields/SiteFieldField'
	import { getDirectEntries, type Entity } from '$lib/pocketbase/content'
	import { fieldTypes } from '../stores/app'

	const { entity, field }: { entity: Entity; field: SiteFieldField } = $props()
	const entry = $derived(getDirectEntries(entity, field)[0])
	const fieldType = $derived($fieldTypes[0]) // TODO: Implement
	const resolvedField = $derived({}) // TODO: Implement
</script>

{#if entry && fieldType}
	{@const SvelteComponent = fieldType.component}
	<SvelteComponent {entity} field={{ ...resolvedField, label: field.label }} />
{:else}
	<span>This field has been deleted</span>
{/if}

<style lang="postcss">
</style>
