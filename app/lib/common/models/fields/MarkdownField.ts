import { z } from 'zod'

export const MarkdownField = z.object({
	type: z.enum(['markdown']),
	key: z.string().nonempty(),
	label: z.string().nonempty()
})

export type MarkdownField = z.infer<typeof MarkdownField>
