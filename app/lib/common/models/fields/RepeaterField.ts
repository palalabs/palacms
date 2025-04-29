import { z } from 'zod'
import { EntityReference } from '../EntityReference'
import { FieldBase } from '../FieldBase'

export const RepeaterField = FieldBase.extend({
	type: z.literal('repeater'),
	fields: z.array(EntityReference('fields'))
})

export type RepeaterField = z.infer<typeof RepeaterField>
