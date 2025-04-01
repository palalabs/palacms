import { z } from 'zod'

export const Id = z.string().nonempty()

export type Id = z.infer<typeof Id>
