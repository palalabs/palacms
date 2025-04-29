import { z } from 'zod'

export const REFERENCE = Symbol('REFERENCE')

export const Reference = (pattern: string) =>
	z
		.object({
			$ref: z.string().regex(new RegExp(pattern))
		})
		.brand(REFERENCE)

export type Reference = z.infer<ReturnType<typeof Reference>>
