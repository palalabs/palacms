import { z } from 'zod'
import { locales } from '../constants'

export const PageTypeSectionEntry = z.object({
	id: z.string().nonempty(),
	locale: z.enum(locales),
	section: z.string().nonempty(),
	field: z.string().nonempty(),
	value: z.any()
})

export type PageTypeSectionEntry = z.infer<typeof PageTypeSectionEntry>
