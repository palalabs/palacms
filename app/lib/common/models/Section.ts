import { z } from 'zod'
import { EntityReference } from './EntityReference'
import { Entity } from './Entity'

export const Section = Entity(
	'sections',
	z.object({
		symbol: EntityReference('symbols')
	})
)

export type Section = z.infer<typeof Section>
