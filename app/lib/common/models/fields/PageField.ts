import { z } from 'zod'
import { Entry } from '../Entry'
import { EntityReference } from '../EntityReference'
import { FieldBase } from '../FieldBase'

export const PageField = FieldBase.extend({
	type: z.literal('page'),
	entries: z.array(Entry(EntityReference('pages'))),
	page_type: EntityReference('page_types')
})

export type PageField = z.infer<typeof PageField>
