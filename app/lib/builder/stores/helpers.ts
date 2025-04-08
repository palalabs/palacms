import { find as _find, chain as _chain, flattenDeep as _flattenDeep } from 'lodash-es'
import * as _ from 'lodash-es'
import type { Resolved } from '$lib/pocketbase/Resolved'
import type { Field } from '$lib/common/models/Field.js'
import { ID, locales, SITE } from '$lib/common/constants'
import type { Entry } from '$lib/common/models/Entry.js'
import type { z } from 'zod'
import { type Id } from '$lib/common/models/Id'

export const get_content = (entity_id: Id, fields: Resolved<typeof Field>[]) => {
	const content: { [K in (typeof locales)[number]]?: Record<string, unknown[]> } = {}
	for (const field of fields) {
		const entries = get_resolved_entries(entity_id, field)
		for (const entry of entries) {
			if (!content[entry.locale]) content[entry.locale] = {}
			if (!content[entry.locale]![field.key]) content[entry.locale]![field.key] = []
			content[entry.locale]![field.key].push(entry.value)
		}
	}
	return content
}

export const get_direct_entries = <T extends Resolved<typeof Field>>(entity_id: Id, field: T) =>
	field.entries?.filter((entry) => (entity_id === SITE ? entry.entity === SITE : entry.entity[ID] === entity_id)) as T['entries']

export const get_resolved_entries = (entity_id: Id, field: Resolved<typeof Field>): Resolved<ReturnType<typeof Entry<z.ZodTypeAny>>>[] => {
	if (field.type === 'page-field') {
		return get_direct_entries(entity_id, field).flatMap((entry) => get_resolved_entries(entry.value.page[ID], entry.value.field))
	} else if (field.type === 'site-field') {
		return get_direct_entries(entity_id, field).flatMap((entry) => get_resolved_entries(SITE, entry.value))
	} else if (field.type === 'page') {
		return get_direct_entries(entity_id, field).flatMap((entry) => entry.value.fields.flatMap((field) => get_resolved_entries(entry.value[ID], field)))
	} else if (field.type === 'page-list') {
		return get_direct_entries(entity_id, field).flatMap((entry) => entry.value.flatMap((page) => page.fields.flatMap((field) => get_resolved_entries(page[ID], field))))
	} else {
		return get_direct_entries(entity_id, field) ?? []
	}
}
