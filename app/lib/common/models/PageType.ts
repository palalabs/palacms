import { z } from 'zod'
import { SiteEntityReference } from './SiteEntityReference'
import { Id } from './Id'
import { ID } from '../constants'

export const PageType = z.object({
	[ID]: Id,
	name: z.string().nonempty(),
	code: z.object({
		head: z.string(),
		foot: z.string()
	}),
	color: z.string(),
	icon: z.string(),
	fields: z.array(SiteEntityReference('fields')),
	sections: z.array(SiteEntityReference('sections'))
})

export type PageType = z.infer<typeof PageType>
