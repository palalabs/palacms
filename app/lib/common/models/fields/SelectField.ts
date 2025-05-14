import { FieldBase } from '../FieldBase'
import { z } from 'zod'

export const SelectField = FieldBase.extend({
	type: z.literal('select'),
	config: z.object({
		options: z
			.object({
				value: z.string().nonempty(),
				label: z.string().nonempty(),
				icon: z.string()
			})
			.array()
	})
})

export type SelectField = z.infer<typeof SelectField>
