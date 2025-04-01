import { z } from 'zod'
import { EntityReference } from './EntityReference'

export const Section = z.object({
	symbol: EntityReference('symbols')
})

export type Section = z.infer<typeof Section>
