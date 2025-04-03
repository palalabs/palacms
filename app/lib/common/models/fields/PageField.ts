import { z } from 'zod'
import { Entry } from '../Entry'
import { SiteEntityReference } from '../SiteEntityReference'
import { FieldBase } from '../FieldBase'

export const PageField = FieldBase.extend({
	type: z.enum(['page']),
	entries: z.array(Entry(SiteEntityReference('pages'))),
	page_type: SiteEntityReference('page_types')
})

export type PageField = z.infer<typeof PageField>
