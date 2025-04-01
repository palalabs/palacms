import { z } from 'zod'
import { Symbol } from './Symbol'
import { Section } from './Section'
import { Id } from './Id'
import { Field } from './Field'
import { PageType } from './PageType'
import { Page } from './Page'
import { EntityReference, type EntityType } from './EntityReference'

export const Site = z.object({
	id: Id,
	group: Id,
	data: z.object({
		name: z.string().nonempty(),
		description: z.string(),
		group: z.string(),
		owner: z.string().nonempty(),
		code: z.object({
			head: z.string(),
			foot: z.string()
		}),
		design: z.object({
			heading_font: z.string(),
			body_font: z.string(),
			primary_color: z.string(),
			radius: z.string(),
			shadow: z.string()
		}),
		entities: z.object({
			symbols: z.record(Id, Symbol),
			sections: z.record(Id, Section),
			fields: z.record(Id, Field),
			page_types: z.record(Id, PageType),
			pages: z.record(Id, Page)
		} satisfies Record<EntityType, unknown>),
		fields: z.array(EntityReference('fields')),
		root: EntityReference('pages')
	}),
	index: z.number().int().nonnegative()
})

export type Site = z.infer<typeof Site>
