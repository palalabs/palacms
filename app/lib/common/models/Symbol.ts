import { z } from 'zod'
import { SiteEntityReference } from './SiteEntityReference'
import { Id } from './Id'
import { ID } from '../constants'

export const Symbol = z.object({
	[ID]: Id,
	name: z.string().nonempty(),
	code: z.object({
		js: z.string(),
		css: z.string(),
		html: z.string()
	}),
	fields: z.array(SiteEntityReference('fields'))
})

export type Symbol = z.infer<typeof Symbol>
