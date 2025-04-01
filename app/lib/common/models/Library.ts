import { z } from 'zod'
import { Id } from './Id'
import { Site } from './Site'
import { Symbol } from './Symbol'

export const SymbolGroup = z.object({
	name: z.string().nonempty(),
	symbols: z.array(Symbol)
})

export const Library = z.object({
	id: z.string().nonempty(),
	owner: z.string().nonempty(),
	data: z.object({
		head: z.string(),
		design: z.object({
			heading_font: z.string(),
			body_font: z.string(),
			primary_color: z.string(),
			radius: z.string(),
			shadow: z.string()
		}),
		starters: z.record(Id, Site),
		symbols: z.record(Id, SymbolGroup)
	})
})

export type Library = z.infer<typeof Library>
