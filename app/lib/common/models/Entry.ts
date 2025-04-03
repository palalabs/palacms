import { z } from 'zod'
import { locales, SITE } from '../constants'
import { SiteEntityReference } from './SiteEntityReference'

export const Entry = <T extends z.ZodTypeAny>(value: T) =>
	z.object({
		locale: z.enum(locales),
		entity: z.union([SiteEntityReference('symbols'), SiteEntityReference('sections'), SiteEntityReference('pages'), SiteEntityReference('page_types'), z.enum([SITE])]),
		value
	})

export type Entry<T extends z.ZodTypeAny> = z.infer<ReturnType<typeof Entry<T>>>
