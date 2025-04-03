import { z } from 'zod'
import { Id } from './Id'
import { Site } from './Site'
import { Symbol } from './Symbol'
import { LibraryEntityReference, type LibraryEntityType } from './LibraryEntityReference'
import { ID } from '../constants'

export const SymbolGroup = z.object({
	[ID]: Id,
	name: z.string().nonempty(),
	symbols: z.array(LibraryEntityReference('symbols'))
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
		entities: z.object({
			symbols: z.record(Id, Symbol),
			symbol_groups: z.record(Id, SymbolGroup)
		} satisfies Record<LibraryEntityType, unknown>),
		symbol_groups: z.array(LibraryEntityReference('symbol_groups'))
	})
})

export type Library = z.infer<typeof Library>
