import { z } from 'zod'
import { Entry } from './Entry'

export const SiteSymbolEntry = Entry.extend({
	field: z.string().nonempty()
})

export type SiteSymbolEntry = z.infer<typeof SiteSymbolEntry>
