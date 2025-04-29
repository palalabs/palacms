import { z } from 'zod'
import { EntityReference } from './EntityReference'
import { Entity } from './Entity'

export const Page = Entity(
	'pages',
	z.object({
		name: z.string().nonempty(),
		slug: z.string(),
		page_type: EntityReference('page_types'),
		fields: z.array(EntityReference('fields')),
		sections: z.array(EntityReference('sections')),
		children: z.array(EntityReference('pages'))
	})
)

export type Page = z.infer<typeof Page>
