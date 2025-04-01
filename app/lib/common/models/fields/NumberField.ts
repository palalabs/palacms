import { z } from 'zod'

export const NumberField = z.object({
	type: z.enum(['number']),
	key: z.string().nonempty(),
	label: z.string().nonempty()
})

export type NumberField = z.infer<typeof NumberField>
