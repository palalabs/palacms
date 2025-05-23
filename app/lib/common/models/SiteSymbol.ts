import { z } from 'zod'
import { Symbol } from './Symbol'

export const SiteSymbol = Symbol.extend({
	site: z.string().nonempty()
})

export type SiteSymbol = z.infer<typeof SiteSymbol>
