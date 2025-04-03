import { FieldBase } from '../FieldBase'
import { z } from 'zod'

export const SwitchField = FieldBase.extend({
	type: z.enum(['switch'])
})

export type SwitchField = z.infer<typeof SwitchField>
