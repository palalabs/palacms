import { z } from 'zod'
import { Field } from './Field'

export const SiteField = Field.and(
	z.object({
		symbol: z.string().nonempty()
	})
)

export type SiteField = z.infer<typeof SiteField>
