import { find as _find, chain as _chain, flattenDeep as _flattenDeep } from 'lodash-es'
import * as _ from 'lodash-es'
import type { Entry } from '$lib/common/models/Entry.js'
import type { locales } from '../common'
import { SiteFields, Sites } from './collections'
import { LibrarySymbolEntry } from '../common/models/LibrarySymbolEntry'
import type { models } from '$lib/common/models'
import type { z } from 'zod'
import type { Field } from '../common/models/Field'
import { PageSectionEntry } from '../common/models/PageSectionEntry'
import { PageTypeSectionEntry } from '../common/models/PageTypeSectionEntry'
import { SiteSymbolEntry } from '../common/models/SiteSymbolEntry'
import { SiteEntry } from '../common/models/SiteEntry'

/**
 * Entry models by name of the owning collection.
 */
export const ENTRY_MODELS = {
	library_symbols: LibrarySymbolEntry,
	sites: SiteEntry,
	site_symbols: SiteSymbolEntry,
	page_type_sections: PageTypeSectionEntry,
	page_sections: PageSectionEntry
} as const

export type EntryOf<Collection extends keyof typeof ENTRY_MODELS> = z.TypeOf<(typeof ENTRY_MODELS)[Collection]>
export type EntityOf<Collection extends keyof typeof ENTRY_MODELS> = z.TypeOf<(typeof models)[Collection]> & { entries: () => EntryOf<Collection>[] }
export type Entity = EntityOf<keyof typeof ENTRY_MODELS>

export const getContent = <Collection extends keyof typeof ENTRY_MODELS>(entity: EntityOf<Collection>, fields: Field[]) => {
	const content: { [K in (typeof locales)[number]]?: Record<string, unknown[]> } = {}
	for (const field of fields) {
		const entries = getResolvedEntries(entity, field)
		for (const entry of entries) {
			if (!content[entry.locale]) content[entry.locale] = {}
			if (!content[entry.locale]![field.key]) content[entry.locale]![field.key] = []
			content[entry.locale]![field.key].push(entry.value)
		}
	}
	return content
}

export const getDirectEntries = <Collection extends keyof typeof ENTRY_MODELS>(entity: EntityOf<Collection>, field: Field): EntryOf<Collection>[] => {
	return entity.entries().filter((entry) => entry.field === field.id)
}

export const getResolvedEntries = <Collection extends keyof typeof ENTRY_MODELS>(entity: EntityOf<Collection>, field: Field): Entry[] => {
	const entries = getDirectEntries(entity, field)
	if (field.type === 'page-field') {
		throw new Error('Not implemented')
		// return entries.flatMap((entry) => {
		// 	const page = Pages.one(entry.value.page)
		// 	const field = SiteSymbolFields.one(entry.value.field)
		// 	if (!page || !field) return []
		// 	return get_resolved_entries(page, field)
		// })
	} else if (field.type === 'site-field') {
		return entries.flatMap((entry) => {
			const field = SiteFields.one(entry.value)
			if (!field) return []
			const site = Sites.one(field.site)
			if (!site) return []
			return getResolvedEntries(site, field)
		})
	} else if (field.type === 'page') {
		throw new Error('Not implemented')
		// return entries.flatMap((entry) => {
		// 	const page = Pages.one(entry.value)
		// 	if (!page) return []
		// 	return page.fields().flatMap((field) => get_resolved_entries(page, field))
		// })
	} else if (field.type === 'page-list') {
		throw new Error('Not implemented')
		// return entries.flatMap((entry) =>
		// 	entry.value.flatMap((page_id: string) => {
		// 		const page = Pages.one(page_id)
		// 		if (!page) return []
		// 		const symbols = page
		// 			.sections()
		// 			.map((section) => section.symbol())
		// 			.filter(isNotUndefined)
		// 			.filter(deduplicate)
		// 		const fields = symbols.flatMap((symbol) => symbol.fields())
		// 		return fields.flatMap((field) => get_resolved_entries(field))
		// 	})
		// )
	} else {
		return entries
	}
}

// const isNotUndefined = <T>(item: T): item is Exclude<T, undefined> => item !== undefined
// const deduplicate = <T>(item: T, index: number, array: T[]) => array.indexOf(item) === index
