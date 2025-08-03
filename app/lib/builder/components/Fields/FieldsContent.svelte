<script lang="ts" module>
	/**
	 * Map of field key to object keyed by index specifying value and optionally sub-values.
	 */
	export type FieldValueMap = Record<string, Record<number, { value: unknown; subValues?: FieldValueMap }>>

	/**
	 * Handler used when reporting change of field value.
	 */
	export type FieldValueHandler = (values: FieldValueMap) => void

	export function setFieldEntries(options: {
		fields?: Field[]
		entries?: Entry[]
		updateEntry: (id: string, data: Partial<Entry>) => Entry
		createEntry: (data: Omit<Entry, 'id'>) => Entry
		values: FieldValueMap
		parent?: Entry
	}) {
		const { fields, entries, updateEntry, createEntry, values, parent } = options
		console.log(values)
		for (const [key, items] of Object.entries(values)) {
			for (const index in items) {
				const field = fields?.find((field) => field.key === key && (parent ? field.parent === parent?.field : !field.parent))
				if (!field) {
					continue
				}

				let entry = entries?.find((entry) => entry.field === field?.id && (parent ? entry.parent === parent?.id : !entry.parent) && entry.index === +index)
				if (entry) {
					console.log('update', field.id, entry.id, items[index].value)
					entry = updateEntry(entry.id, { value: items[index].value })
				} else {
					console.log('create', field.id, items[index].value)
					entry = createEntry({ field: field.id, parent: parent?.id, index: +index, locale: 'en', value: items[index].value })
				}

				if (items[index].subValues) {
					setFieldEntries({ ...options, values: items[index].subValues, parent: entry })
				}
			}
		}
	}
</script>

<script lang="ts">
	import Icon from '@iconify/svelte'
	import * as _ from 'lodash-es'
	import FieldItem from './FieldItem.svelte'
	import { fieldTypes } from '../../stores/app/index.js'
	import { mod_key_held } from '../../stores/app/misc.js'
	import type { Field } from '$lib/common/models/Field'
	import type { Entity } from '$lib/pocketbase/content'
	import type { Entry } from '$lib/common/models/Entry'
	import type { Component } from 'svelte'
	import EntryContent from './EntryContent.svelte'

	let {
		entity,
		fields,
		entries,
		create_field,
		oninput,
		onchange,
		ondelete
	}: {
		entity: Entity
		fields: Field[]
		entries: Entry[]
		create_field: (parentId?: string) => void
		oninput: FieldValueHandler
		onchange: (details: { id: string; data: Partial<Field> }) => void
		ondelete: (field_id: string) => void
	} = $props()

	function get_component(field: Field) {
		const fieldType = $fieldTypes.find((ft) => ft.id === field.type)
		if (fieldType) {
			return fieldType.component as Component<{
				entity: Entity
				field: Field
				entry?: Entry
				fields: Field[]
				entries: Entry[]
				onchange: FieldValueHandler
				level: number
			}>
		} else {
			console.warn(`Field type '${field.type}' no longer exists, removing '${field.label}' field`)
			return null
		}
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
		<!-- TODO: $userRole === 'DEV' -->
		{@const active_tab = selected_tabs[field.id] || 'field'}
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
							{onchange}
							{ondelete}
							onduplicate={() => {
								// TODO: Implement duplicate
							}}
							onmove={(direction) => {
								// TODO: Implement move
							}}
						/>
					</div>
				{:else if active_tab === 'entry'}
					<EntryContent {entity} {field} {fields} {entries} level={0} onchange={oninput} />
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
