import { z } from 'zod'
import { SiteEntityReference } from './SiteEntityReference'
import { Id } from './Id'
import { ID } from '../constants'

export const Page = z.object({
	[ID]: Id,
	name: z.string().nonempty(),
	slug: z.string().nonempty(),
	page_type: SiteEntityReference('page_types'),
	fields: z.array(SiteEntityReference('fields')),
	sections: z.array(SiteEntityReference('sections')),
	children: z.array(SiteEntityReference('pages'))
})

export type Page = z.infer<typeof Page>
