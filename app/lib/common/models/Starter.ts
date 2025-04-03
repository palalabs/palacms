import { z } from 'zod'
import { Site } from './Site'

export const Starter = Site.omit({
	group: true
})

export type Starter = z.infer<typeof Starter>
