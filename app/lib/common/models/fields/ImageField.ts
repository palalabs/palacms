import { z } from 'zod'

export const ImageField = z.object({
	type: z.enum(['image']),
	key: z.string().nonempty(),
	label: z.string().nonempty()
})

export type ImageField = z.infer<typeof ImageField>
