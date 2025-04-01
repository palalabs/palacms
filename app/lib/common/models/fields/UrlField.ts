import { z } from 'zod'

export const UrlField = z.object({
	type: z.enum(['url']),
	key: z.string().nonempty(),
	label: z.string().nonempty()
})

export type UrlField = z.infer<typeof UrlField>
