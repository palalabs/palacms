import { z } from 'zod'

export const Page = z.object({
	id: z.string().nonempty(),
	name: z.string().nonempty(),
	slug: z.string().nonempty(),
	page_type: z.string().nonempty(),
	parent: z.string().nonempty(),
	site: z.string().nonempty()
})

export type Page = z.infer<typeof Page>
