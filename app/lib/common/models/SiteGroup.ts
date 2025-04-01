import { z } from 'zod'
import { Id } from './Id'

export const SiteGroup = z.object({
	id: Id,
	name: z.string().nonempty(),
	owner: Id,
	index: z.number().int().nonnegative()
})

export type SiteGroup = z.infer<typeof SiteGroup>
