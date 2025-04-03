import { z } from 'zod'
import { SiteEntityReference } from './SiteEntityReference'
import { Id } from './Id'
import { ID } from '../constants'

export const Section = z.object({
	[ID]: Id,
	symbol: SiteEntityReference('symbols')
})

export type Section = z.infer<typeof Section>
