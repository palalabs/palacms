import { z } from 'zod'

export const Symbol = z.object({
	id: z.string().nonempty(),
	name: z.string().nonempty(),
	js: z.string(),
	css: z.string(),
	html: z.string()
})

export type Symbol = z.infer<typeof Symbol>
