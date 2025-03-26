import { z } from 'zod'

export const User = z.object({
	id: z.string().nonempty(),
	email: z.string().nonempty()
})

export type User = z.infer<typeof User>
