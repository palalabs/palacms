import { z } from 'zod'
import { Reference } from './Reference'

export const LIBRARY_ENTITY_REFERENCE = Symbol('LIBRARY_ENTITY_REFERENCE')

export const libraryEntityTypes = ['symbols', 'symbol_groups'] as const

export type LibraryEntityType = (typeof libraryEntityTypes)[number]

export type LibraryEntityReference<T extends LibraryEntityType> = {
	$ref: `#/data/entities/${T}/${string}`
}

export const LibraryEntityReference = <T extends LibraryEntityType>(type: T) =>
	Object.assign(Reference(`^#/data/entities/${type}/[^/]+$`), { [LIBRARY_ENTITY_REFERENCE]: type }) as z.ZodType<LibraryEntityReference<T>> & {
		[LIBRARY_ENTITY_REFERENCE]: T
	}

export const createLibraryEntityReference = <T extends LibraryEntityType>(type: T, id: string): LibraryEntityReference<T> => ({ $ref: `#/entities/${type}/${id}` })
