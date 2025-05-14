import { z } from 'zod'
import { Entry } from './Entry'

export const SiteEntry = Entry.extend({
	id: z.string().nonempty(),
	site_field: z.string().nonempty()
})

export type SiteEntry = z.infer<typeof SiteEntry>
