import { z } from 'zod'
import { Field } from './Field'

export const SymbolField = Field.and(
	z.object({
		symbol: z.string().nonempty()
	})
)

export type SymbolField = z.infer<typeof SymbolField>
