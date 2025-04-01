import { z } from 'zod'
import { EntityReference } from '../EntityReference'

export const RepeaterField = z.object({
	type: z.enum(['repeater']),
	key: z.string().nonempty(),
	label: z.string().nonempty(),
	fields: z.array(EntityReference('fields'))
})

export type RepeaterField = z.infer<typeof RepeaterField>
