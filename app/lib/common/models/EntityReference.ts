import { z } from 'zod'

export const ENTITY_REFERENCE_TYPE = Symbol('ENTITY_REFERENCE_TYPE')

export const EntityReference = <T extends string>(type: T) =>
	Object.assign(
		z.object({
			$ref: z.string().regex(new RegExp(`^#/data/entities/${type}/[^/]+$`)) as z.ZodType<`#/data/entities/${T}/${string}`>
		}),
		{ [ENTITY_REFERENCE_TYPE]: type }
	)

export type EntityReference<T extends string> = { $ref: `#/data/entities/${T}/${string}` }
