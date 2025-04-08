import { z } from 'zod'
import { SiteEntityReference } from './SiteEntityReference'

export const FieldBase = z.object({
	type: z.string(),
	key: z.string().nonempty(),
	label: z.string().nonempty(),
	entries: z.undefined(),
	condition: z
		.object({
			field: SiteEntityReference('fields'),
			comparison: z.enum(['=', '!=']),
			value: z.unknown()
		})
		.optional()
})

export type FieldBase = z.infer<typeof FieldBase>
