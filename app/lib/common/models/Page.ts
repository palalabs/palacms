import { z } from 'zod'

export const Page = z.object({
	id: z.string().nonempty(),
	name: z.string().nonempty(),
	slug: z.string(),
	page_type: z.string().nonempty(),
	parent: z.string(),
	site: z.string().nonempty()
})

export type Page = z.infer<typeof Page>
