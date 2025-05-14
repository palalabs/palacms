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
import { Symbol } from './Symbol'
import { SymbolEntry } from './SymbolEntry'
import { SymbolField } from './SymbolField'
import { User } from './User'

/**
 * Model for each collection. Used in a PocketBase hook to validate records.
 */
export const models = {
	users: User,
	page_section_entries: PageSectionEntry,
	page_sections: PageSection,
	page_type_section_entries: PageTypeSectionEntry,
	page_type_sections: PageTypeSection,
	page_type_symbols: PageTypeSymbol,
	page_types: PageType,
	pages: Page,
	site_entries: SiteEntry,
	site_fields: SiteField,
	site_groups: SiteGroup,
	sites: Site,
	symbol_entries: SymbolEntry,
	symbol_fields: SymbolField,
	symbols: Symbol
} satisfies Record<string, import('zod').ZodType>
