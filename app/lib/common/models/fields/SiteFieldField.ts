import { z } from 'zod'
import { Entry } from '../Entry'
import { EntityReference } from '../EntityReference'
import { FieldBase } from '../FieldBase'

export const SiteFieldField = FieldBase.extend({
	type: z.enum(['site-field']),
	entries: z.array(Entry(EntityReference('fields')))
})

export type SiteFieldField = z.infer<typeof SiteFieldField>
