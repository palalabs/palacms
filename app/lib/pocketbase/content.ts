import type { Entry } from '$lib/common/models/Entry.js'
import type { locales } from '../common'
import { SiteFields, Sites, Pages, PageTypeFields, PageTypes } from './collections'
import { LibrarySymbolEntry } from '../common/models/LibrarySymbolEntry'
import type { models } from '$lib/common/models'
import type { z } from 'zod'
import type { Field } from '../common/models/Field'
import { PageSectionEntry } from '../common/models/PageSectionEntry'
import { PageTypeSectionEntry } from '../common/models/PageTypeSectionEntry'
import { SiteSymbolEntry } from '../common/models/SiteSymbolEntry'
import { SiteEntry } from '../common/models/SiteEntry'
import { PageTypeEntry } from '$lib/common/models/PageTypeEntry'
import { PageEntry } from '$lib/common/models/PageEntry'

/**
 * Entry models by name of the owning collection.
 */
export const ENTRY_MODELS = {
	library_symbols: LibrarySymbolEntry,
	sites: SiteEntry,
	site_symbols: SiteSymbolEntry,
	page_types: PageTypeEntry,
	pages: PageEntry,
	page_type_sections: PageTypeSectionEntry,
	page_sections: PageSectionEntry
} as const

export type EntryOf<Collection extends keyof typeof ENTRY_MODELS> = z.TypeOf<(typeof ENTRY_MODELS)[Collection]>
export type EntityOf<Collection extends keyof typeof ENTRY_MODELS> = z.TypeOf<(typeof models)[Collection]>
export type Entity = EntityOf<keyof typeof ENTRY_MODELS>

export const getContent = <Collection extends keyof typeof ENTRY_MODELS>(entity: EntityOf<Collection>, fields: Field[], entries: EntryOf<Collection>[]) => {
	const content: { [K in (typeof locales)[number]]?: Record<string, unknown[]> } = {}
	fields = fields
		.filter((field) =>
			'symbol' in entity
				? 'symbol' in field && field.symbol === entity.symbol
				: (!('symbol' in field) || field.symbol === entity.id) && (!('site' in field) || field.site === entity.id) && (!('page_type' in field) || field.page_type === entity.id)
		)
		// Deduplicate
		.filter((field1, index, array) => array.findIndex((field2) => field2.id === field1.id) === index)
	for (const field of fields) {
		const fieldEntries = getResolvedEntries(entity, field, entries)

		// Handle group fields specially - collect subfield entries into an object
		if (field.type === 'group' && field.key) {
			if (!content.en) content.en = {}

			// Find all subfields for this group
			const subfields = fields.filter((f) => f.parent === field.id)
			const groupObject: Record<string, unknown> = {}

			// Collect each subfield's value
			for (const subfield of subfields) {
				const subfieldEntries = getDirectEntries(entity, subfield, entries)
				if (subfieldEntries.length > 0) {
					// Use the last entry if there are multiple (same as single fields)
					const subfieldEntry = subfieldEntries[subfieldEntries.length - 1]
					groupObject[subfield.key] = subfieldEntry.value
				} else {
					// Default empty value for missing subfields
					groupObject[subfield.key] = ''
				}
			}

			content.en![field.key] = groupObject
		}
		// If field has a key but no entries, fill with empty value
		else if (field.key && fieldEntries.length === 0) {
			if (!content.en) content.en = {}
			// For repeater fields, use empty array; for single fields, use empty string/appropriate default
			if (field.type === 'repeater') {
				content.en![field.key] = []
			} else {
				content.en![field.key] = ''
			}
		} else {
			for (const entry of fieldEntries) {
				if (!content[entry.locale]) content[entry.locale] = {}

				// For repeater fields, collect values in array; for single fields, use direct value
				if (field.type === 'repeater') {
					if (!content[entry.locale]![field.key]) content[entry.locale]![field.key] = []
					content[entry.locale]![field.key].push(entry.value)
				} else {
					// For single-value fields, just use the value directly (last one wins if multiple)
					content[entry.locale]![field.key] = entry.value
				}
			}
		}
	}
	return content
}

export const getDirectEntries = <Collection extends keyof typeof ENTRY_MODELS>(entity: EntityOf<Collection>, field: Field, entries: EntryOf<Collection>[]): EntryOf<Collection>[] => {
	if (!entries) return []
	return entries.filter((entry) => entry.field === field.id && (!('section' in entry) || entry.section === entity.id))
}

export const getResolvedEntries = <Collection extends keyof typeof ENTRY_MODELS>(entity: EntityOf<Collection>, field: Field, entries: EntryOf<Collection>[]): Entry[] => {
	const fieldEntries = getDirectEntries(entity, field, entries)
	if (field.type === 'page-field') {
		// For page-field, get the referenced field value directly from the page
		if (!field.config?.field) {
			console.log('page-field: no config.field')
			return []
		}

		const pageField = PageTypeFields.one(field.config.field)
		if (!pageField) {
			console.log('page-field: pageField not found for', field.config.field)
			return []
		}

		// Get the page entity and its entries
		let pageEntity, pageEntries
		if ('page' in entity) {
			// This is a page section, get the page
			pageEntity = Pages.one(entity.page)
			pageEntries = pageEntity?.entries() || []
		} else {
			// This might be the page itself
			pageEntity = entity
			pageEntries = entries
		}

		// Get entries for the referenced field from the page
		const directEntries = getDirectEntries(pageEntity, pageField, pageEntries)
		return directEntries
	} else if (field.type === 'site-field') {
		// For site-field, get the referenced field value directly from the site
		if (!field.config?.field) return []

		const siteField = SiteFields.one(field.config.field)
		if (!siteField) return []

		// Get the site entity and its entries
		const site = Sites.one(siteField.site)
		if (!site) return []

		const siteEntries = site.entries() || []

		// Get entries for the referenced field from the site
		const directEntries = getDirectEntries(site, siteField, siteEntries)
		return directEntries
	} else if (field.type === 'page') {
		return fieldEntries
			.map((entry) => {
				const page = Pages.one(entry.value)
				if (!page) return null

				// Get all entries from all fields in the page
				const pageEntries = page.entries() || []
				// Get fields from the page's page type
				const pageType = PageTypes.one(page.page_type)
				if (!pageType) return null

				// Build the page content object manually
				const pageFields = pageType.fields() || []
				const pageContentObject = {}

				for (const pageField of pageFields) {
					const fieldEntries = pageEntries.filter((e) => e.field === pageField.id)
					if (fieldEntries.length > 0) {
						// Use the last entry if there are multiple (same as getContent logic)
						const fieldEntry = fieldEntries[fieldEntries.length - 1]
						pageContentObject[pageField.key] = fieldEntry.value
					}
				}

				// Create the page field value with content and metadata
				const pageValue = {
					...pageContentObject,
					_meta: {
						created_at: page.created,
						name: page.name,
						slug: page.slug,
						url: `/${page.slug}`
					}
				}

				// Return an entry with the structured page value
				return {
					...entry,
					value: pageValue
				}
			})
			.filter(Boolean)
	} else if (field.type === 'page-list') {
		return fieldEntries.flatMap((entry) =>
			entry.value.flatMap((page_id: string) => {
				const page = Pages.one(page_id)
				if (!page) return []
				const symbols = page
					.sections()
					.map((section) => section.symbol())
					.filter(isNotUndefined)
					.filter(deduplicate)
				const fields = symbols.flatMap((symbol) => symbol.fields())
				const pageEntries = page.entries()
				return fields.flatMap((pageField) => getResolvedEntries(page, pageField, pageEntries))
			})
		)
	} else {
		return fieldEntries
	}
}

const isNotUndefined = <T>(item: T): item is Exclude<T, undefined> => item !== undefined
const deduplicate = <T>(item: T, index: number, array: T[]) => array.indexOf(item) === index
