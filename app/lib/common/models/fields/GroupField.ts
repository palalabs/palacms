import { z } from 'zod'
import { EntityReference } from '../EntityReference'
import { FieldBase } from '../FieldBase'

export const GroupField = FieldBase.extend({
	type: z.literal('group'),
	fields: z.array(EntityReference('fields'))
})

export type GroupField = z.infer<typeof GroupField>
