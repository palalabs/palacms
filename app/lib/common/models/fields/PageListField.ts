import { z } from 'zod'

export const PageListField = z.object({
	type: z.enum(['page-list']),
	key: z.string().nonempty(),
	label: z.string().nonempty()
})

export type PageListField = z.infer<typeof PageListField>
