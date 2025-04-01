import { z } from 'zod'

export type Reference = {
	$ref: string
}

export const Reference = (pattern: string) =>
	z.object({
		$ref: z.string().regex(new RegExp(pattern))
	}) as z.ZodType<Reference>
