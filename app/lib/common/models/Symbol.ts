import { z } from 'zod'
import { EntityReference } from './EntityReference'

export const Symbol = z.object({
	name: z.string().nonempty(),
	code: z.object({
		js: z.string(),
		css: z.string(),
		html: z.string()
	}),
	fields: z.array(EntityReference('fields'))
})

export type Symbol = z.infer<typeof Symbol>
