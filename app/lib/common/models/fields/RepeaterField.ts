import { z } from 'zod'
import { FieldBase } from '../FieldBase'

export const RepeaterField = FieldBase.extend({
	type: z.literal('repeater')
	// TODO: Sub-fields
})

export type RepeaterField = z.infer<typeof RepeaterField>
