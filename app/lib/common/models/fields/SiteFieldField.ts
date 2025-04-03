import { z } from 'zod'
import { Entry } from '../Entry'
import { SiteEntityReference } from '../SiteEntityReference'
import { FieldBase } from '../FieldBase'

export const SiteFieldField = FieldBase.extend({
	type: z.enum(['site-field']),
	entries: z.array(Entry(SiteEntityReference('fields')))
})

export type SiteFieldField = z.infer<typeof SiteFieldField>
