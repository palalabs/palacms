import { z } from 'zod'
import { Id } from '../Id'
import { Entry } from '../Entry'

export const TextField = z.object({
	type: z.enum(['text']),
	key: z.string().nonempty(),
	label: z.string().nonempty(),
	values: z.array(Entry(z.string()))
})

export type TextField = z.infer<typeof TextField>
