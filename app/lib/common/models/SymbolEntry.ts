import { z } from 'zod'
import { Entry } from './Entry'

export const SymbolEntry = Entry.extend({
	symbol_field: z.string().nonempty()
})

export type SymbolEntry = z.infer<typeof SymbolEntry>
