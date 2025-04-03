import { z } from 'zod'
import { Reference } from './Reference'

export const SITE_ENTITY_REFERENCE = Symbol('SITE_ENTITY_REFERENCE')

export const siteEntityTypes = ['symbols', 'sections', 'fields', 'page_types', 'pages'] as const

export type SiteEntityType = (typeof siteEntityTypes)[number]

export type SiteEntityReference<T extends SiteEntityType> = {
	$ref: `#/data/entities/${T}/${string}`
}

export const SiteEntityReference = <T extends SiteEntityType>(type: T) =>
	Object.assign(Reference(`^#/data/entities/${type}/[^/]+$`), { [SITE_ENTITY_REFERENCE]: type }) as z.ZodType<SiteEntityReference<T>> & {
		[SITE_ENTITY_REFERENCE]: T
	}

export const createSiteEntityReference = <T extends SiteEntityType>(type: T, id: string): SiteEntityReference<T> => ({ $ref: `#/entities/${type}/${id}` })
