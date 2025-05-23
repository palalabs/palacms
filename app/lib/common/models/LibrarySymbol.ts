import { z } from 'zod'
import { Symbol } from './Symbol'

export const LibrarySymbol = Symbol.extend({
	library_symbol_group: z.string().nonempty()
})

export type LibrarySymbol = z.infer<typeof LibrarySymbol>
