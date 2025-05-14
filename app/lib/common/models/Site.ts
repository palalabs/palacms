import { z } from 'zod'

export const Site = z.object({
	id: z.string().nonempty(),
	name: z.string().nonempty(),
	description: z.string(),
	group: z.string().nonempty(),
	head: z.string(),
	foot: z.string(),
	index: z.number().int().nonnegative()
})

export type Site = z.infer<typeof Site>
