import { z } from 'zod'

export const LinkField = z.object({
	type: z.enum(['link']),
	key: z.string().nonempty(),
	label: z.string().nonempty()
})

export type LinkField = z.infer<typeof LinkField>
