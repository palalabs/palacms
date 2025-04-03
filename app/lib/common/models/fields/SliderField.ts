import { FieldBase } from '../FieldBase'
import { z } from 'zod'

export const SliderField = FieldBase.extend({
	type: z.enum(['slider'])
})

export type SliderField = z.infer<typeof SliderField>
