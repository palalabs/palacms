import { z } from 'zod'
import { Entry } from './Entry'

export const SiteEntry = Entry.extend({
	field: z.string().nonempty()
})

export type SiteEntry = z.infer<typeof SiteEntry>
