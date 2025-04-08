import { z } from 'zod'
import { SiteEntityReference } from './SiteEntityReference'

export const Section = z.object({
	symbol: SiteEntityReference('symbols')
})

export type Section = z.infer<typeof Section>
