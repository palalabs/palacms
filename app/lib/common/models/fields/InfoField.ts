import { FieldBase } from '../FieldBase'
import { z } from 'zod'

export const InfoField = FieldBase.extend({
	type: z.enum(['info'])
})

export type InfoField = z.infer<typeof InfoField>
