import { z } from 'zod'
import { locales } from '../constants'

export const PageSectionEntry = z.object({
	id: z.string().nonempty(),
	locale: z.enum(locales),
	section: z.string().nonempty(),
	field: z.string().nonempty(),
	value: z.any()
})

export type PageSectionEntry = z.infer<typeof PageSectionEntry>
