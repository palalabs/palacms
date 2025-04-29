import { Entry } from '../Entry'
import { FieldBase } from '../FieldBase'
import { z } from 'zod'
import { EntityReference } from '../EntityReference'

export const PageListField = FieldBase.extend({
	type: z.enum(['page-list']),
	entries: z.array(Entry(z.array(EntityReference('pages')))),
	page_type: EntityReference('page_types')
})

export type PageListField = z.infer<typeof PageListField>
