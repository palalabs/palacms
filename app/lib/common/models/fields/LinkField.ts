import { Entry } from '../Entry'
import { FieldBase } from '../FieldBase'
import { z } from 'zod'
import { SiteEntityReference } from '../SiteEntityReference'

export const LinkField = FieldBase.extend({
	type: z.enum(['link']),
	entries: z.array(Entry(z.object({ label: z.string(), url: z.string(), active: z.boolean(), page: SiteEntityReference('pages').optional() })))
})

export type LinkField = z.infer<typeof LinkField>
