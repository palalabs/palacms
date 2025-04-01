import { z } from 'zod'
import { Entry } from '../Entry'
import { EntityReference } from '../EntityReference'

export const SiteFieldField = z.object({
	type: z.enum(['site-field']),
	key: z.string().nonempty(),
	label: z.string().nonempty(),
	values: z.array(Entry(EntityReference('fields')))
})

export type SiteFieldField = z.infer<typeof SiteFieldField>
