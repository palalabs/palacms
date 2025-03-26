import { User } from './User'

export const models = {
	users: User
} satisfies Record<string, import('zod').AnyZodObject>
