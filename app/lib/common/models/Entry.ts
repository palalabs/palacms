import { z } from 'zod'
import { locales, SITE } from '../constants'
import { EntityReference } from './EntityReference'

export const Entry = <T extends z.ZodTypeAny>(value: T) =>
	z.object({
		locale: z.enum(locales),
		entity: z.union([EntityReference('symbols'), EntityReference('sections'), EntityReference('pages'), EntityReference('page_types'), z.literal(SITE)]),
		value
	})

export type Entry<T extends z.ZodTypeAny = z.ZodTypeAny> = z.infer<ReturnType<typeof Entry<T>>>
