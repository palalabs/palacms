import { z } from 'zod'
import { Entry } from '../Entry'
import { EntityReference } from '../EntityReference'
import { FieldBase } from '../FieldBase'

export const PageFieldField = FieldBase.extend({
	type: z.enum(['page-field']),
	entries: z.array(Entry(z.object({ page: EntityReference('pages'), field: EntityReference('fields') })))
})

export type PageFieldField = z.infer<typeof PageFieldField>
