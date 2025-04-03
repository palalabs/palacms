import { z } from 'zod'
import { Entry } from '../Entry'
import { SiteEntityReference } from '../SiteEntityReference'
import { FieldBase } from '../FieldBase'

export const PageFieldField = FieldBase.extend({
	type: z.enum(['page-field']),
	entries: z.array(Entry(z.object({ page: SiteEntityReference('pages'), field: SiteEntityReference('fields') })))
})

export type PageFieldField = z.infer<typeof PageFieldField>
