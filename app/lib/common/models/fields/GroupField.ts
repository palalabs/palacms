import { z } from 'zod'
import { EntityReference } from '../EntityReference'

export const GroupField = z.object({
	type: z.enum(['group']),
	key: z.string().nonempty(),
	label: z.string().nonempty(),
	fields: z.array(EntityReference('fields'))
})

export type GroupField = z.infer<typeof GroupField>
