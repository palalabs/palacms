import { z } from 'zod'
import { SiteEntityReference } from './SiteEntityReference'

export const Page = z.object({
	name: z.string().nonempty(),
	slug: z.string().nonempty(),
	page_type: SiteEntityReference('page_types'),
	fields: z.array(SiteEntityReference('fields')),
	sections: z.array(SiteEntityReference('sections')),
	children: z.array(SiteEntityReference('pages'))
})

export type Page = z.infer<typeof Page>
