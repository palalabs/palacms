import { z } from 'zod'
import { Entry } from '../Entry'
import { EntityReference } from '../EntityReference'

export const PageField = z.object({
	type: z.enum(['page']),
	key: z.string().nonempty(),
	label: z.string().nonempty(),
	values: z.array(Entry(EntityReference('pages')))
})

export type PageField = z.infer<typeof PageField>
