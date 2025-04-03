import { FieldBase } from '../FieldBase'
import { z } from 'zod'

export const NumberField = FieldBase.extend({
	type: z.enum(['number'])
})

export type NumberField = z.infer<typeof NumberField>
