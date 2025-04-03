import { Entry } from '../Entry'
import { FieldBase } from '../FieldBase'
import { z } from 'zod'
import { SiteEntityReference } from '../SiteEntityReference'

export const PageListField = FieldBase.extend({
	type: z.enum(['page-list']),
	entries: z.array(Entry(z.array(SiteEntityReference('pages')))),
	page_type: SiteEntityReference('page_types')
})

export type PageListField = z.infer<typeof PageListField>
