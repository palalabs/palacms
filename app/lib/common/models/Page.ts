import { z } from 'zod'
import { EntityReference } from './EntityReference'

export type Page = {
	name: string
	slug: string
	page_type: EntityReference<'page_types'>
	children: Page[]
}

export const Page: z.ZodType<Page> = z.object({
	name: z.string().nonempty(),
	slug: z.string().nonempty(),
	site: z.string().nonempty(),
	page_type: EntityReference('page_types'),
	fields: z.array(EntityReference('fields')),
	sections: z.array(EntityReference('sections')),
	children: z.lazy(() => z.array(Page))
})
