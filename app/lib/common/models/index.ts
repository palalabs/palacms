import { Site } from './Site'
import { Page } from './Page'
import { PageSection } from './PageSection'
import { PageSectionEntry } from './PageSectionEntry'
import { PageType } from './PageType'
import { PageTypeSection } from './PageTypeSection'
import { PageTypeSectionEntry } from './PageTypeSectionEntry'
import { PageTypeSymbol } from './PageTypeSymbol'
import { SiteEntry } from './SiteEntry'
import { SiteField } from './SiteField'
import { SiteGroup } from './SiteGroup'
import { SiteSymbol } from './SiteSymbol'
import { SiteSymbolEntry } from './SiteSymbolEntry'
import { SiteSymbolField } from './SiteSymbolField'
import { User } from './User'
import { LibrarySymbolEntry } from './LibrarySymbolEntry'
import { LibrarySymbolField } from './LibrarySymbolField'
import { LibrarySymbolGroup } from './LibrarySymbolGroup'
import { LibrarySymbol } from './LibrarySymbol'
import { PageTypeField } from './PageTypeField'
import { PageTypeEntry } from './PageTypeEntry'

/**
 * Model for each collection. Used in a PocketBase hook to validate records.
 */
export const models = {
	users: User,
	library_symbol_entries: LibrarySymbolEntry,
	library_symbol_fields: LibrarySymbolField,
	library_symbol_groups: LibrarySymbolGroup,
	library_symbols: LibrarySymbol,
	page_section_entries: PageSectionEntry,
	page_sections: PageSection,
	page_type_section_entries: PageTypeSectionEntry,
	page_type_sections: PageTypeSection,
	page_type_entries: PageTypeEntry,
	page_type_fields: PageTypeField,
	page_type_symbols: PageTypeSymbol,
	page_types: PageType,
	pages: Page,
	site_entries: SiteEntry,
	site_fields: SiteField,
	site_groups: SiteGroup,
	sites: Site,
	site_symbol_entries: SiteSymbolEntry,
	site_symbol_fields: SiteSymbolField,
	site_symbols: SiteSymbol
} satisfies Record<string, import('zod').ZodType>
