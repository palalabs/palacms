import { Entry } from '../Entry'
import { FieldBase } from '../FieldBase'
import { z } from 'zod'
import { EntityReference } from '../EntityReference'

export const LinkField = FieldBase.extend({
	type: z.literal('link'),
	entries: z.array(Entry(z.object({ label: z.string(), url: z.string(), active: z.boolean(), page: EntityReference('pages').optional() })))
})

export type LinkField = z.infer<typeof LinkField>
