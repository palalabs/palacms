import { z } from 'zod'

export const IconField = z.object({
	type: z.enum(['icon']),
	key: z.string().nonempty(),
	label: z.string().nonempty()
})

export type IconField = z.infer<typeof IconField>
