import { z } from 'zod'
import { Id } from './Id'

export const User = z.object({
	id: Id,
	email: z.string().nonempty()
})

export type User = z.infer<typeof User>
