import { FieldBase } from '../FieldBase'
import { z } from 'zod'

export const MarkdownField = FieldBase.extend({
	type: z.enum(['markdown'])
})

export type MarkdownField = z.infer<typeof MarkdownField>
