import { z } from 'zod'
import { SiteEntityReference } from './SiteEntityReference'

export const PageType = z.object({
	name: z.string().nonempty(),
	code: z.object({
		head: z.string(),
		foot: z.string()
	}),
	color: z.string(),
	icon: z.string(),
	fields: z.array(SiteEntityReference('fields')),
	sections: z.array(SiteEntityReference('sections')),
	symbols: z.array(SiteEntityReference('symbols'))
})

export type PageType = z.infer<typeof PageType>
