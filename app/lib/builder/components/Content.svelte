<script lang="ts">
	import * as _ from 'lodash-es'
	import Card from '../ui/Card.svelte'
	import { fieldTypes } from '../stores/app'
	import type { Field } from '$lib/common/models/Field'
	import { getDirectEntries, type Entity } from '$lib/pocketbase/content'
	import type { Entry } from '$lib/common/models/Entry'

	const { entity, fields, entries, oninput }: { entity: Entity; entries: Entry[]; fields: Field[]; oninput: (values: Record<string, unknown>) => void } = $props()

	function check_condition(field: Field) {
		// TODO: Implement
		return true
		// if (!field.condition) return true // has no condition

		// const { field: field_to_compare, value, comparison } = field.condition
		// const entry = getResolvedEntries(entity_id, field)[0]
		// if (typeof value === 'string' && is_regex(value)) {
		// 	const regex = new RegExp(value.slice(1, -1))
		// 	if (comparison === '=' && regex.test(entry.value)) {
		// 		return true
		// 	} else if (comparison === '!=' && !regex.test(entry.value)) {
		// 		return true
		// 	}
		// } else if (comparison === '=' && value === entry.value) {
		// 	return true
		// } else if (comparison === '!=' && value !== entry.value) {
		// 	return true
		// }
		// return false
	}
</script>

<div class="Content">
	{#each fields as field}
		{@const field_type = $fieldTypes.find((f) => f.id === field.type)}
		<!-- weird race condition bug, fields is dirty when switching pages w/ sidebar open -->
		{@const Field_Component = field_type?.component}
		{@const is_visible = check_condition(field)}
		{@const is_valid = (field.key || field.type === 'info') && Field_Component}
		{@const has_child_fields = field.type === 'repeater' || field.type === 'group'}
		{@const content_entry = getDirectEntries(entity, field, entries)[0]}
		{#if is_valid && is_visible}
			<Card title={has_child_fields ? field.label : null} icon={field_type?.icon}>
				<div class="field-item" id="field-{field.key}" class:repeater={field.key === 'repeater'}>
					<Field_Component
						{entity}
						field={{ ...field, label: `${field.label} (PAGE FIELD)` }}
						entry={content_entry}
						onchange={(value) => {
							oninput({ [field.key]: value })
						}}
					/>
				</div>
			</Card>
		{:else if is_valid && is_visible}
			<Card title={has_child_fields ? field.label : null} icon={field_type?.icon}>
				<div class="field-item" id="field-{field.key}" class:repeater={field.key === 'repeater'}>
					<Field_Component
						{entity}
						{field}
						entry={content_entry}
						onchange={(value) => {
							oninput({ [field.key]: value })
						}}
					/>
				</div>
			</Card>
		{:else if is_visible}
			<p class="empty-description">Field requires a key</p>
		{/if}
	{:else}
		<p class="empty-description">
			<!-- $userRole === 'DEV' -->
			{#if true}
				When you create fields, they'll be editable from here
			{:else}
				When the site developer creates fields, they'll be editable from here
			{/if}
		</p>
	{/each}
</div>

<style lang="postcss">
	.Content {
		width: 100%;
		display: grid;
		gap: 1rem;
		padding-bottom: 0.5rem;
		/* padding-block: 0.5rem; */
		color: var(--color-gray-2);
		/* background: var(--primo-color-black); */
		height: 100%;
		overflow-y: auto;
		place-content: flex-start;
		justify-content: stretch;

		.empty-description {
			color: var(--color-gray-4);
			font-size: var(--font-size-2);
			height: 100%;
			display: flex;
			align-items: flex-start;
			justify-content: center;
			margin-top: 12px;
		}
	}
</style>
