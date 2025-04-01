import { z } from 'zod'
import { Entry } from '../Entry'
import { EntityReference } from '../EntityReference'

export const PageFieldField = z.object({
	type: z.enum(['page-field']),
	key: z.string().nonempty(),
	label: z.string().nonempty(),
	values: z.array(Entry(EntityReference('fields')))
})

export type PageFieldField = z.infer<typeof PageFieldField>
