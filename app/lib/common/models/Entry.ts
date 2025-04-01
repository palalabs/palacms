import { z } from 'zod'
import { locales } from '../constants'
import { EntityReference } from './EntityReference'

export type Entry<T> = {
	locale: (typeof locales)[number]
	value: T
}

export const Entry = <T>(value: z.ZodType<T>) =>
	z.object({
		locale: z.enum(locales),
		entity: z.union([EntityReference('sections'), EntityReference('page_types'), z.enum(['site'])]),
		value
	}) as z.ZodType<Entry<T>>
