import { z } from 'zod'

export const InfoField = z.object({
	type: z.enum(['info']),
	key: z.string().nonempty(),
	label: z.string().nonempty()
})

export type InfoField = z.infer<typeof InfoField>
