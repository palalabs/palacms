import { z } from 'zod'

export const SliderField = z.object({
	type: z.enum(['slider']),
	key: z.string().nonempty(),
	label: z.string().nonempty()
})

export type SliderField = z.infer<typeof SliderField>
