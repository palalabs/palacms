import { LibrarySymbol } from '$lib/common/models/LibrarySymbol'
import { LibrarySymbolEntry } from '$lib/common/models/LibrarySymbolEntry'
import { LibrarySymbolField } from '$lib/common/models/LibrarySymbolField'
import { LibrarySymbolGroup } from '$lib/common/models/LibrarySymbolGroup'
import { Page } from '$lib/common/models/Page'
import { PageSection } from '$lib/common/models/PageSection'
import { PageSectionEntry } from '$lib/common/models/PageSectionEntry'
import { PageType } from '$lib/common/models/PageType'
import { PageTypeSection } from '$lib/common/models/PageTypeSection'
import { PageTypeSectionEntry } from '$lib/common/models/PageTypeSectionEntry'
import { PageTypeSymbol } from '$lib/common/models/PageTypeSymbol'
import { Site } from '$lib/common/models/Site'
import { SiteEntry } from '$lib/common/models/SiteEntry'
import { SiteField } from '$lib/common/models/SiteField'
import { SiteGroup } from '$lib/common/models/SiteGroup'
import { SiteSymbol } from '$lib/common/models/SiteSymbol'
import { SiteSymbolEntry } from '$lib/common/models/SiteSymbolEntry'
import { SiteSymbolField } from '$lib/common/models/SiteSymbolField'
import { User } from '$lib/common/models/User'
import { createCollectionMapping } from './CollectionMapping.svelte'

export const Users = createCollectionMapping('users', User, {
	links: {
		site_groups() {
			return SiteGroups.list({ filter: `owner = "${this.id}"` })
		}
	}
})

export const LibrarySymbolGroups = createCollectionMapping('library_symbol_groups', LibrarySymbolGroup, {
	links: {
		symbols() {
			return LibrarySymbols.from(this.collection.instance).list({ filter: `group = "${this.id}"` })
		}
	}
})

export const LibrarySymbols = createCollectionMapping('library_symbols', LibrarySymbol, {
	links: {
		fields() {
			return LibrarySymbolFields.from(this.collection.instance).list({ filter: `symbol = "${this.id}"` })
		},
		entries() {
			return LibrarySymbolFields.from(this.collection.instance)
				.list({ filter: `symbol = "${this.id}"` })
				.flatMap((field) => field.entries())
		}
	}
})

export const LibrarySymbolFields = createCollectionMapping('library_symbol_fields', LibrarySymbolField, {
	links: {
		entries() {
			return LibrarySymbolEntries.from(this.collection.instance).list({ filter: `field = "${this.id}"` })
		}
	}
})

export const LibrarySymbolEntries = createCollectionMapping('library_symbol_entries', LibrarySymbolEntry, {
	links: {}
})

export const SiteGroups = createCollectionMapping('site_groups', SiteGroup, {
	links: {
		sites() {
			return Sites.from(this.collection.instance).list({ filter: `group = "${this.id}"` })
		}
	}
})

export const Sites = createCollectionMapping('sites', Site, {
	links: {
		symbols() {
			return SiteSymbols.from(this.collection.instance).list({ filter: `site = "${this.id}"` })
		},
		fields() {
			return SiteFields.from(this.collection.instance).list({ filter: `site = "${this.id}"` })
		},
		entries() {
			return SiteFields.from(this.collection.instance)
				.list({ filter: `site = "${this.id}"` })
				.flatMap((field) => field.entries())
		},
		page_types() {
			return PageTypes.from(this.collection.instance).list({ filter: `site = "${this.id}"` })
		},
		pages() {
			return Pages.from(this.collection.instance).list({ filter: `site = "${this.id}"` })
		},
		homepage() {
			return Pages.from(this.collection.instance).list({ filter: `site = "${this.id}" && parent = ''` })[0]
		}
	}
})

export const SiteFields = createCollectionMapping('site_fields', SiteField, {
	links: {
		entries() {
			return SiteEntries.from(this.collection.instance).list({ filter: `field = "${this.id}"` })
		}
	}
})

export const SiteEntries = createCollectionMapping('site_entries', SiteEntry, {
	links: {}
})

export const SiteSymbols = createCollectionMapping('site_symbols', SiteSymbol, {
	links: {
		fields() {
			return SiteSymbolFields.from(this.collection.instance).list({ filter: `symbol = "${this.id}"` })
		},
		entries() {
			return SiteSymbolFields.from(this.collection.instance)
				.list({ filter: `symbol = "${this.id}"` })
				.flatMap((field) => field.entries())
		}
	}
})

export const SiteSymbolFields = createCollectionMapping('site_symbol_fields', SiteSymbolField, {
	links: {
		entries() {
			return SiteSymbolEntries.from(this.collection.instance).list({ filter: `field = "${this.id}"` })
		}
	}
})

export const SiteSymbolEntries = createCollectionMapping('site_symbol_entries', SiteSymbolEntry, {
	links: {}
})

export const PageTypes = createCollectionMapping('page_types', PageType, {
	links: {
		symbols() {
			return PageTypeSymbols.from(this.collection.instance).list({ filter: `page_type = "${this.id}"` })
		},
		sections() {
			return PageTypeSections.from(this.collection.instance).list({ filter: `page_type = "${this.id}"` })
		},
		fields() {
			// TODO: Implement
			return []
		}
	}
})

export const PageTypeSymbols = createCollectionMapping('page_type_symbols', PageTypeSymbol, {
	links: {}
})

export const PageTypeSections = createCollectionMapping('page_type_sections', PageTypeSection, {
	links: {
		entries() {
			return PageTypeSectionEntries.from(this.collection.instance).list({ filter: `section = "${this.id}"` })
		}
	}
})

export const PageTypeSectionEntries = createCollectionMapping('page_type_section_entries', PageTypeSectionEntry, {
	links: {}
})

export const Pages = createCollectionMapping('pages', Page, {
	links: {
		children() {
			return this.collection.list({ filter: `parent = "${this.id}"` })
		},
		sections() {
			return PageSections.from(this.collection.instance).list({ filter: `page = "${this.id}"` })
		}
	}
})

export const PageSections = createCollectionMapping('page_sections', PageSection, {
	links: {
		entries() {
			return PageSectionEntries.from(this.collection.instance).list({ filter: `section = "${this.id}"` })
		}
	}
})

export const PageSectionEntries = createCollectionMapping('page_section_entries', PageSectionEntry, {
	links: {}
})
