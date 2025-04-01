import { z } from 'zod'
import { EntityReference } from './EntityReference'

export const PageType = z.object({
	name: z.string().nonempty(),
	code: z.object({
		head: z.string(),
		foot: z.string()
	}),
	color: z.string(),
	icon: z.string(),
	fields: z.array(EntityReference('fields'))
})

export type PageType = z.infer<typeof PageType>
