import { z } from 'zod'
import { locales } from '../constants'

export const PageTypeSectionEntry = z.object({
	id: z.string().nonempty(),
	locale: z.enum(locales),
	page_type_section: z.string().nonempty(),
	site_symbol_field: z.string().nonempty(),
	value: z.any()
})

export type PageTypeSectionEntry = z.infer<typeof PageTypeSectionEntry>
