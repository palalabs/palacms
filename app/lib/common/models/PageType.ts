import { z } from 'zod'
import { EntityReference } from './EntityReference'
import { Entity } from './Entity'

export const PageType = Entity(
	'page_types',
	z.object({
		name: z.string().nonempty(),
		code: z.object({
			head: z.string(),
			foot: z.string()
		}),
		color: z.string(),
		icon: z.string(),
		fields: z.array(EntityReference('fields')),
		sections: z.array(EntityReference('sections')),
		symbols: z.array(EntityReference('symbols'))
	})
)

export type PageType = z.infer<typeof PageType>
