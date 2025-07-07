<script lang="ts">
	import UI from '../ui'
	import type { Entity } from '$lib/pocketbase/content'
	import type { Field } from '$lib/common/models/Field'
	import type { Entry } from '$lib/common/models/Entry'
	import { SiteSymbolFields } from '$lib/pocketbase/collections'

	let { field, entry, onchange }: { entity: Omit<Entity, 'id'>; field: Omit<Field, 'id'>; entry?: Omit<Entry, 'id'>; onchange: (value: any) => void } = $props()

	const value = $derived(entry?.value)
	// Access staged field config through collection mapping system
	const currentField = $derived(SiteSymbolFields.one(field.id))
	const options = $derived(currentField?.config?.options || [])
</script>

<div class="SelectField">
	{#if options.length > 0}
		<UI.Select fullwidth={true} label={field.label} {options} {value} on:input={({ detail }) => onchange(detail)} />
	{:else}
		<span>This field doesn't have any options</span>
	{/if}
</div>

<style lang="postcss">
	.SelectField {
		width: 100%;
	}
</style>
