import { z } from 'zod'
import { Entry } from '../Entry'
import { FieldBase } from '../FieldBase'

export const TextField = FieldBase.extend({
	type: z.literal('text'),
	entries: z.array(Entry(z.string()))
})

export type TextField = z.infer<typeof TextField>
