import { z } from 'zod'
import { Symbol } from './Symbol'
import { Section } from './Section'
import { Id } from './Id'
import { Field } from './Field'
import { PageType } from './PageType'
import { Page } from './Page'
import { EntityReference } from './EntityReference'

export const siteEntityTypes = ['symbols', 'sections', 'fields', 'page_types', 'pages'] as const

export type SiteEntityType = (typeof siteEntityTypes)[number]

export const Site = z.object({
	id: Id,
	group: Id,
	name: z.string().nonempty(),
	description: z.string(),
	data: z.object({
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
		} satisfies Record<SiteEntityType, unknown>),
		symbols: z.array(EntityReference('symbols')),
		fields: z.array(EntityReference('fields')),
		page_types: z.array(EntityReference('page_types')),
		root: EntityReference('pages')
	}),
	index: z.number().int().nonnegative()
})

export type Site = z.infer<typeof Site>
