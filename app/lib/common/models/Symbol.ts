import { z } from 'zod'
import { SiteEntityReference } from './SiteEntityReference'

export const Symbol = z.object({
	name: z.string().nonempty(),
	code: z.object({
		js: z.string(),
		css: z.string(),
		html: z.string()
	}),
	fields: z.array(SiteEntityReference('fields'))
})

export type Symbol = z.infer<typeof Symbol>
