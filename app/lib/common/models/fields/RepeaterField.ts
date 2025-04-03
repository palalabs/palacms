import { z } from 'zod'
import { SiteEntityReference } from '../SiteEntityReference'
import { FieldBase } from '../FieldBase'

export const RepeaterField = FieldBase.extend({
	type: z.enum(['repeater']),
	fields: z.array(SiteEntityReference('fields'))
})

export type RepeaterField = z.infer<typeof RepeaterField>
