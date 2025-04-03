import { Entry } from '../Entry'
import { FieldBase } from '../FieldBase'
import { z } from 'zod'

export const ImageField = FieldBase.extend({
	type: z.enum(['image']),
	entries: z.array(Entry(z.object({ url: z.string(), alt: z.string() }))),
	maxSizeMB: z.number().positive().optional(),
	maxWidthOrHeight: z.number().int().positive().optional()
})

export type ImageField = z.infer<typeof ImageField>
