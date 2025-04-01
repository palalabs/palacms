import { z } from 'zod'

export const SelectField = z.object({
	type: z.enum(['select']),
	key: z.string().nonempty(),
	label: z.string().nonempty()
})

export type SelectField = z.infer<typeof SelectField>
