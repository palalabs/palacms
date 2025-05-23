import { z } from 'zod'
import { Entry } from './Entry'

export const LibrarySymbolEntry = Entry.extend({
	library_symbol_field: z.string().nonempty()
})

export type LibrarySymbolEntry = z.infer<typeof LibrarySymbolEntry>
