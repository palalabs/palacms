<script lang="ts">
	import Icon from '@iconify/svelte'
	import * as _ from 'lodash-es'
	import FieldItem from './FieldItem.svelte'
	import { fieldTypes } from '../../stores/app/index.js'
	import Card from '../../ui/Card.svelte'
	import { mod_key_held } from '../../stores/app/misc.js'
	import type { Field } from '$lib/common/models/Field'
	import { getDirectEntries, getResolvedEntries, type Entity } from '$lib/pocketbase/content'
	import type { Entry } from '$lib/common/models/Entry'

	let {
		entity,
		fields,
		entries,
		create_field,
		oninput,
		onchange,
		ondelete,
		onadd
	}: {
		entity: Entity
		fields: Field[]
		entries: Entry[]
		create_field: (parentId?: string) => void
		oninput: (values: Record<string, unknown>) => void
		onchange: (details: { id: string; data: Partial<Field> }) => void
		ondelete: (field_id: string) => void
		onadd?: (details: { parent: string; index: number; subfields: Field[] }) => void
	} = $props()

	$inspect({ entries, fields })

	function get_component(field: Field) {
		const fieldType = $fieldTypes.find((ft) => ft.id === field.type)
		if (fieldType) {
			return fieldType.component
		} else {
			console.warn(`Field type '${field.type}' no longer exists, removing '${field.label}' field`)
			return null
		}
	}

	function check_condition(field: Field) {
		return true // TODO: Implement

		// if (!field.condition) return true // has no condition

		// const { field: field_to_check, value, comparison } = field.condition

		// // TODO: ensure correct field (considering repeaters)
		// const content_entry = get_direct_entries(entity_id, field_to_check)?.[0]
		// if (!content_entry) {
		// 	// comparable entry is a non-matching data field
		// 	// TODO: add UI to conditional component that says "this field will show when data field is irrelevant"
		// 	return true
		// } else if (comparison === '=' && value === content_entry.value) {
		// 	return true
		// } else if (comparison === '!=' && value !== content_entry.valuerable_value) {
		// 	return true
		// } else if (typeof value === 'string' && is_regex(value)) {
		// 	const regex = new RegExp(value.slice(1, -1))
		// 	if (comparison === '=' && regex.test(content_entry.value)) {
		// 		return true
		// 	} else if (comparison === '!=' && !regex.test(content_entry.value)) {
		// 		return true
		// 	}
		// }
		// return false
	}

	// TABS
	let selected_tabs = $state<Record<string, 'field' | 'entry'>>(Object.fromEntries(fields.map((f) => [f.id, f.key === '' ? 'field' : 'entry'])))

	function select_tab(field_id, tab) {
		selected_tabs[field_id] = tab
	}
	function set_all_tabs(tab) {
		Object.keys(selected_tabs).forEach((field_id) => {
			selected_tabs[field_id] = tab
		})
	}
	// TODO: Implement
	// get(`active-tabs--${id}`).then((saved) => {
	// 	if (saved) {
	// 		Object.keys(saved).forEach((field_id) => {
	// 			const saved_tab = saved[field_id]
	// 			selected_tabs[field_id] = ['field', 'entry'].includes(saved_tab) ? saved_tab : 'entry'
	// 		})
	// 	}
	// })
</script>

<div class="Fields">
	{#each (fields || []).filter((f) => !f.parent || f.parent === '') as field (field.id)}
		{@const Field_Component = get_component(field)}
		<!-- TODO: $userRole === 'DEV' -->
		{@const active_tab = selected_tabs[field.id] || 'field'}
		{@const is_visible = check_condition(field)}
		<div class="entries-item">
			<!-- TODO: hotkeys for tab switching  -->
			<!-- TODO: $userRole === 'DEV' -->
			{#if true}
				<div class="top-tabs">
					<button
						data-test-id="field"
						class:active={active_tab === 'field'}
						disabled={active_tab === 'field'}
						onclick={() => {
							if ($mod_key_held) {
								set_all_tabs('field')
							} else {
								select_tab(field.id, 'field')
							}
						}}
					>
						<Icon icon="fluent:form-48-filled" />
						<span>Field</span>
					</button>
					<button
						data-test-id="entry"
						style="border-top: 1px solid var(--color-gray-9);"
						class:active={active_tab === 'entry'}
						disabled={active_tab === 'entry'}
						onclick={() => {
							if ($mod_key_held) {
								set_all_tabs('entry')
							} else {
								select_tab(field.id, 'entry')
							}
						}}
					>
						<Icon icon={is_visible ? undefined : 'mdi:hide'} />
						{#if field.type === 'repeater'}
							<span>Entries</span>
						{:else}
							<span>Entry</span>
						{/if}
					</button>
				</div>
			{/if}
			<div class="container">
				{#if active_tab === 'field'}
					<div class="FieldItem">
						<FieldItem
							{field}
							{fields}
							{create_field}
							onchange={(data) => {
								// Check if this is already a properly structured onchange call
								if (data.id && data.data) {
									// This is from a subfield, pass it through as-is
									onchange(data)
								} else {
									// This is from the root field itself
									onchange({ id: field.id, data })
								}
							}}
							ondelete={() => ondelete(field.id)}
							onduplicate={() => {
								// TODO: Implement duplicate
							}}
							onmove={(direction) => {
								// TODO: Implement move
							}}
						/>
					</div>
				{:else if active_tab === 'entry'}
					{#if is_visible}
						{#if field.type === 'site-field' || field.type === 'page-field'}
							{@const source_entry = getResolvedEntries(entity, field, entries)[0]}
							{@const title = ['repeater', 'group'].includes(field.type) ? field.label : null}
							{@const icon = undefined}
							<div class="dynamic-header">
								{#if field.type === 'site-field'}
									<Icon icon="gg:website" />
									<span>Site Content</span>
								{:else if field.type === 'page-field'}
									{@const content_entry = getDirectEntries(entity, field, entries)[0]}
									<!-- <Icon icon={content_entry?.value.page.page_type.icon} /> -->
									<span>Page Content</span>
								{/if}
							</div>
							<Card {title} {icon}>
								<Field_Component {entity} {field} {fields} {entries} entry={source_entry} id={source_entry?.id} onchange={(value) => oninput({ [field.key]: value })} />
							</Card>
						{:else}
							{@const content_entry = getDirectEntries(entity, field, entries)[0]}
							{@const title = ['repeater', 'group'].includes(field.type) ? field.label : null}
							{@const icon = undefined}
							<Card {title} {icon}>
								<Field_Component {entity} {field} {fields} {entries} entry={content_entry} id={content_entry?.id} onchange={(value) => oninput({ [field.key]: value })} on:add={(event) => {
								if (onadd) onadd(event.detail)
							}} />
							</Card>
						{/if}
						<!-- TODO: $userRole === 'DEV' -->
					{:else if !is_visible}
						<div class="hidden-field">
							<Icon icon="mdi:hidden" />
							<span>This field will be hidden from content editors</span>
						</div>
					{/if}
				{/if}
			</div>
		</div>
	{/each}
	<!-- TODO: $userRole === 'DEV' -->
	{#if true}
		<button class="field-button" onclick={() => create_field()}>
			<div class="icon">
				<Icon icon="fa-solid:plus" />
			</div>
			<span>Create Field</span>
		</button>
	{/if}
</div>

<style lang="postcss">
	.Fields {
		width: 100%;
		display: grid;
		gap: 1rem;
		/* padding-top: 0.5rem; */
		padding-bottom: 1rem;
		padding-right: 10px;
		color: var(--color-gray-2);
		height: 100%;
		overflow-y: auto;
		place-content: flex-start;
		justify-content: stretch;
	}
	.dynamic-header {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		border-bottom: 1px solid var(--color-gray-9);
		padding-block: 0.5rem;
		font-size: 0.75rem;
	}
	.hidden-field {
		padding: 1rem;
		color: var(--color-gray-2);
		font-size: 0.875rem;
	}
	.entries-item {
		display: grid;
		background: #1a1a1a;
		border-radius: 0.5rem;
		/* grid-template-columns: 1fr auto; */

		.container {
			border-bottom-left-radius: var(--primo-border-radius);
			border-bottom-right-radius: var(--primo-border-radius);
			overflow: hidden;
		}
		.top-tabs {
			display: grid;
			grid-template-columns: 1fr 1fr;
			button {
				background: #111;
				transition: 0.1s;
				opacity: 0.5;
				padding: 0.5rem;
				border-bottom: 1px solid var(--color-gray-9);
				display: flex;
				justify-content: center;
				align-items: center;
				gap: 0.5rem;
				font-size: 0.75rem;
			}

			button[disabled] {
				cursor: initial;
			}

			button:hover {
				opacity: 0.6;
			}

			button:first-child {
				border-top-left-radius: var(--primo-border-radius);
			}

			button:last-child {
				border-top-right-radius: var(--primo-border-radius);
			}

			button.active {
				background: transparent;
				color: var(--color-gray-2);
				opacity: 1;
			}
		}
	}
	.field-button {
		width: 100%;
		/* background: #292929; */
		background: var(--primo-color-codeblack);
		color: var(--button-color);
		transition:
			background 0.1s,
			color 0.1s;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		/* font-size: 0.875rem; */
		font-size: var(--font-size-1);
		padding: 0.375rem;
		border-radius: 4px;
		font-weight: 400;
		border: 1px solid transparent;
		transition: 0.1s;

		&:hover {
			/* background: #333333; */
			background: #292929;
		}

		&:focus {
			border-color: var(--weave-primary-color);
		}
		&:focus-visible {
			outline: 0;
		}
	}
</style>
