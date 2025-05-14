import { z } from 'zod'

export const FieldBase = z.object({
	id: z.string().nonempty(),
	key: z.string().nonempty(),
	label: z.string().nonempty(),
	type: z.string().nonempty(),
	config: z.null()
})

export type FieldBase = z.infer<typeof FieldBase>
