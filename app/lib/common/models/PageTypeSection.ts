import { z } from 'zod'

export const PageTypeSection = z.object({
	id: z.string().nonempty(),
	page_type: z.string().nonempty(),
	symbol: z.string().nonempty(),
	index: z.number().int().nonnegative(),
	zone: z.union([
		z.enum(['header', 'body', 'footer']),
		z.literal('').transform(() => undefined),
		z.undefined()
	]).optional()
})

export type PageTypeSection = z.infer<typeof PageTypeSection>
