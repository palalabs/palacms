import { z } from 'zod'

export const User = z.object({
	id: z.string(),
	email: z.string().nonempty(),
	serverRole: z.enum(['editor', 'developer', '']).optional()
})

export type User = z.infer<typeof User>
