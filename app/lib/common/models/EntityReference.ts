import { z } from 'zod'
import { Reference } from './Reference'

export const entityTypes = ['symbols', 'sections', 'fields', 'page_types', 'pages'] as const

export type EntityType = (typeof entityTypes)[number]

export type EntityReference<T extends EntityType> = {
	$ref: `#/entities/${T}/${string}`
}

export const EntityReference = <T extends EntityType>(type: T) => Reference(`^#/entities/${type}/[^/]+$`) as z.ZodType<EntityReference<T>>
