import { z } from 'zod'
import { SiteEntityReference } from '../SiteEntityReference'
import { FieldBase } from '../FieldBase'

export const GroupField = FieldBase.extend({
	type: z.enum(['group']),
	fields: z.array(SiteEntityReference('fields'))
})

export type GroupField = z.infer<typeof GroupField>
