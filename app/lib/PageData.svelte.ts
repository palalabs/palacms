import type { ObjectOf } from './pocketbase/CollectionMapping'
import { Pages, PageTypes, Sites, SiteSymbols } from './pocketbase/collections'

export const usePageData = (site?: ObjectOf<typeof Sites>, pages?: ObjectOf<typeof Pages>[]) => {
	const page_types = $derived(pages?.every((page) => PageTypes.one(page.page_type) !== undefined) ? pages.flatMap((page) => PageTypes.one(page.page_type) ?? []) : undefined)
	const page_sections = $derived(pages?.every((page) => page.sections() !== undefined) ? pages.flatMap((page) => page.sections() ?? []) : undefined)
	const page_type_sections = $derived(page_types?.every((page_type) => page_type.sections() !== undefined) ? page_types.flatMap((page_type) => page_type.sections() ?? []) : undefined)
	const page_type_symbols = $derived(page_types?.every((page_type) => page_type.symbols() !== undefined) ? page_types.flatMap((page_type) => page_type.symbols() ?? []) : undefined)
	const symbols = $derived(page_sections && page_type_sections && [...page_sections, ...page_type_sections].map((section) => SiteSymbols.one(section.symbol)).filter((symbol) => symbol !== undefined))
	const site_fields = $derived(site?.fields())
	const page_type_fields = $derived(page_types?.every((page_type) => page_type.fields() !== undefined) ? page_types.flatMap((page_type) => page_type.fields() ?? []) : undefined)
	const symbol_fields = $derived(symbols?.every((symbol) => symbol.fields() !== undefined) ? symbols.flatMap((symbol) => symbol.fields() ?? []) : undefined)
	const site_entries = $derived(site?.entries())
	const page_type_entries = $derived(page_types?.every((page_type) => page_type.entries() !== undefined) ? page_types.flatMap((page_type) => page_type.entries() ?? []) : undefined)
	const symbol_entries = $derived(symbols?.every((symbol) => symbol.entries() !== undefined) ? symbols.flatMap((symbol) => symbol.entries() ?? []) : undefined)
	const page_entries = $derived(pages?.every((page) => page.entries() !== undefined) ? pages.flatMap((page) => page.entries() ?? []) : undefined)
	const page_section_entries = $derived(page_sections?.every((section) => section.entries() !== undefined) ? page_sections.flatMap((section) => section.entries() ?? []) : undefined)
	const page_type_section_entries = $derived(page_type_sections?.every((section) => section.entries() !== undefined) ? page_type_sections.flatMap((section) => section.entries() ?? []) : undefined)

	return new (class {
		data = $derived(
			site &&
				pages &&
				page_types &&
				page_sections &&
				page_type_sections &&
				page_type_symbols &&
				symbols &&
				site_fields &&
				page_type_fields &&
				symbol_fields &&
				site_entries &&
				page_type_entries &&
				symbol_entries &&
				page_entries &&
				page_section_entries &&
				page_type_section_entries && {
					site,
					pages,
					page_types,
					page_sections,
					page_type_sections,
					page_type_symbols,
					symbols,
					site_fields,
					page_type_fields,
					symbol_fields,
					site_entries,
					page_type_entries,
					page_entries,
					symbol_entries,
					page_section_entries,
					page_type_section_entries
				}
		)
	})()
}
