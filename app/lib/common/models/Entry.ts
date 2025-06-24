import { z } from 'zod'
import { locales } from '../constants'

export const Entry = z.object({
	id: z.string().nonempty(),
	locale: z.enum(locales),
	value: z.any(),
	field: z.string().nonempty()
})

export type Entry = z.infer<typeof Entry>
