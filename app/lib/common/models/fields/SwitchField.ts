import { z } from 'zod'

export const SwitchField = z.object({
	type: z.enum(['switch']),
	key: z.string().nonempty(),
	label: z.string().nonempty()
})

export type SwitchField = z.infer<typeof SwitchField>
