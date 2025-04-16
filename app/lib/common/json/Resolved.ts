import { z } from 'zod'
import { decodeUriFragmentIdentifier, JsonPointer } from 'json-ptr'
import { SITE_ENTITY_REFERENCE, type SiteEntityType } from '../models/SiteEntityReference'
import type { Site } from '../models/Site'
import { LIBRARY_ENTITY_REFERENCE, type LibraryEntityType } from '../models/LibraryEntityReference'
import type { Library } from '../models/Library'
import { ID } from '../constants'
import { Id, newId } from '../models/Id'

type RequiredProperties<T extends Record<string, unknown>> = { [K in keyof T]: T extends undefined ? never : K }[keyof T]
type OptionalProperties<T extends Record<string, unknown>> = { [K in keyof T]: T extends undefined ? K : never }[keyof T]

export type Resolved<T extends z.ZodTypeAny, P extends object = object> = T extends {
	[SITE_ENTITY_REFERENCE]: SiteEntityType
}
	? Resolved<(typeof Site)['shape']['data']['shape']['entities']['shape'][T[typeof SITE_ENTITY_REFERENCE]]['element'], P> & P
	: T extends {
				[LIBRARY_ENTITY_REFERENCE]: LibraryEntityType
		  }
		? Resolved<(typeof Library)['shape']['data']['shape']['entities']['shape'][T[typeof LIBRARY_ENTITY_REFERENCE]]['element'], P> & P
		: T extends z.AnyZodObject
			? {
					[K in RequiredProperties<T['_output']>]: Resolved<T['shape'][K], P>
				} & {
					[K in OptionalProperties<T['_output']>]?: Resolved<T['shape'][K], P>
				}
			: T extends z.ZodArray<infer Element>
				? Resolved<Element, P>[]
				: T extends z.ZodRecord<infer Key, infer Element>
					? Record<z.TypeOf<Key>, Resolved<Element, P>>
					: T extends z.ZodUnion<infer Types>
						? { [K in keyof Types]: Resolved<Types[K], P> }[number]
						: T['_output']

export const resolve = <T extends z.AnyZodObject>(model: T, value: z.TypeOf<T>, onUpdate?: () => void): Resolved<T, { [ID]: Id }> => proxy({ value, model, record: value, onUpdate })

export const normalize = <T extends z.AnyZodObject>(model: T, value: Omit<Resolved<T>, 'id'>): z.TypeOf<T> => {
	const record = {}
	normalizeRecursive<T>({ value, model, record, result: record })
	return record
}

const normalizeRecursive = <T extends z.AnyZodObject>({ value, model, record, result, path = [] }: { value: object; model: T; result: any; record: any; path?: (string | number)[] }): void => {
	for (const key in value) {
		if (value[key] && typeof value[key] === 'object') {
			const valueType = walkToType(model, [...path, key])
			const referenceType: SiteEntityType | LibraryEntityType | null = valueType[SITE_ENTITY_REFERENCE] ?? valueType[LIBRARY_ENTITY_REFERENCE] ?? null

			if (referenceType) {
				// Set reference
				if (!record.data) record.data = {}
				if (!record.data.entities) record.data.entities = {}
				if (!record.data.entities[referenceType]) record.data.entities[referenceType] = {}
				const entityId = value[key][ID] ?? (value[key][ID] = newId())
				record.data.entities[referenceType][entityId] = {}
				normalizeRecursive({ value: value[key], model, record, result: record.data.entities[referenceType][entityId], path: ['data', 'entities', referenceType, entityId] })
				result[key] = { $ref: `#/data/entities/${referenceType}/${entityId}` }
				continue
			} else if (Array.isArray(value[key])) {
				// Set array, overwriting if already in result
				result[key] = []
				normalizeRecursive({ value: value[key], model, record, result: result[key], path: [...path, key] })
			} else {
				// Set object, merging if exists already in result
				result[key] = result[key] ?? {}
				normalizeRecursive({ value: value[key], model, record, result: result[key], path: [...path, key] })
				continue
			}
		}

		if (!(key in result)) {
			// Set directly without overwriting
			result[key] = value[key]
			continue
		}
	}
}

const proxy = ({ value, model, record, path = [], onUpdate }: { value: object; model: z.AnyZodObject; record: any; path?: (string | number)[]; onUpdate?: () => void }): any =>
	new Proxy(value, {
		get(target, key) {
			const [propertyKey, _entityType, entityId] = path.slice(-3)
			if (propertyKey === 'entities' && key === ID) {
				return entityId
			}

			let val = target[key]
			if (typeof key === 'symbol') {
				// Could be internal value that is not part of the JSON document
				return val
			}

			if (val === undefined) {
				return undefined
			}

			// Resolve reference
			let innerPath = [...path, key]
			const valueType = walkToType(model, innerPath)
			const referenceType: SiteEntityType | LibraryEntityType | null = valueType[SITE_ENTITY_REFERENCE] ?? valueType[LIBRARY_ENTITY_REFERENCE] ?? null
			if (referenceType) {
				const pointer = val.$ref
				val = JsonPointer.get(record, pointer)
				innerPath = decodeUriFragmentIdentifier(pointer)
			}

			// Return proxy if val is object (or array)
			if (typeof val === 'object') {
				return proxy({
					value: val,
					model,
					record,
					path: innerPath,
					onUpdate
				})
			} else {
				return val
			}
		},
		set(target, key, val) {
			const [propertyKey, _entityType, _entityId] = path.slice(-3)
			if (propertyKey === 'entities' && key === ID) {
				throw new Error('Cannot set ID, it is virtual')
			}

			if (typeof key === 'symbol') {
				// Could be internal value that is not part of the JSON document
				target[key] = val
				return true
			}

			const valueType = walkToType(model, [...path, key])
			const referenceType: SiteEntityType | LibraryEntityType | null = valueType[SITE_ENTITY_REFERENCE] ?? valueType[LIBRARY_ENTITY_REFERENCE] ?? null
			if (referenceType) {
				// Set reference after normalizing
				const entityId = val[ID] ?? (val[ID] = newId())
				record.data.entities[referenceType][entityId] = {}
				normalizeRecursive({ value: val, model, record, result: record.data.entities[referenceType][entityId], path: ['data', 'entities', referenceType, entityId] })
				target[key] = { $ref: `#/data/entities/${referenceType}/${entityId}` }
				onUpdate?.()
				return true
			} else if (Array.isArray(val)) {
				// Set array after normalizing
				target[key] = []
				normalizeRecursive({ value: val, model, record, result: target[key], path: [...path, key] })
				onUpdate?.()
				return true
			} else if (typeof val === 'object') {
				// Set object after normalizing
				target[key] = {}
				normalizeRecursive({ value: val, model, record, result: target[key], path: [...path, key] })
				onUpdate?.()
				return true
			} else {
				// Set directly
				target[key] = val
				onUpdate?.()
				return true
			}
		},
		deleteProperty(target, key) {
			if (typeof key === 'symbol') {
				// Could be internal value that is not part of the JSON document
				delete target[key]
				return true
			}

			if (target[key] === undefined) {
				// Unset or property with undefined value, delete anyway to make sure that it's gone
				delete target[key]
				return true
			}

			const valueType = walkToType(model, [...path, key])
			const referenceType: SiteEntityType | LibraryEntityType | null = valueType[SITE_ENTITY_REFERENCE] ?? valueType[LIBRARY_ENTITY_REFERENCE] ?? null
			const [propertyKey, entityType] = path.slice(-2)
			if (referenceType) {
				const pointer = target[key].$ref
				const pointedPath = decodeUriFragmentIdentifier(pointer)
				const [entityId] = pointedPath.slice(-1)
				deleteEntity({ model, record, entityType: referenceType, entityId })
				onUpdate?.()
				return true
			} else if (propertyKey === 'entities') {
				deleteEntity({ model, record, entityType: entityType as SiteEntityType | LibraryEntityType, entityId: key })
				onUpdate?.()
				return true
			} else {
				// Delete directly
				delete target[key]
				onUpdate?.()
				return true
			}
		}
	})

const walkToType = (type: z.ZodTypeAny | undefined, path: (string | number)[], root?: z.ZodTypeAny): z.ZodTypeAny => {
	root = root ?? type
	if (!type) {
		return z.unknown()
	}
	if (path.length === 0) {
		return type
	}

	const [key, ...restOfPath] = path
	const referenceType: SiteEntityType | LibraryEntityType | null = type[SITE_ENTITY_REFERENCE] ?? type[LIBRARY_ENTITY_REFERENCE] ?? null
	if (referenceType) {
		// Walk through reference
		type = walkToType(root, ['data', 'entities', referenceType, key], root)
		return walkToType(type, restOfPath, root)
	} else if (type instanceof z.ZodObject) {
		return walkToType(type.shape[key], restOfPath, root)
	} else if (type instanceof z.ZodArray) {
		if (!isIntegerString(key.toString())) {
			return z.unknown()
		}
		return walkToType(type.element, restOfPath, root)
	} else if (type instanceof z.ZodRecord) {
		if (!type.keySchema.safeParse(key).success) {
			return z.unknown()
		}
		return walkToType(type.element, restOfPath, root)
	} else if (type instanceof z.ZodUnion) {
		return z.union(
			type.options
				.map((model: z.ZodTypeAny) => {
					try {
						return walkToType(model, [key, ...restOfPath], root)
					} catch {
						return null
					}
				})
				.filter((model) => model !== null)
		)
	} else {
		throw new Error('Cannot walk to type through unimplemented type')
	}
}

const walk = (value: unknown, callback: (value: unknown, path: (string | number)[]) => void, path: (string | number)[] = [], root?: unknown): void => {
	root = root ?? value
	if (!value) {
		return
	} else {
		callback(value, path)
	}

	if (Array.isArray(value)) {
		for (let index = 0; index < value.length; index++) {
			walk(value[index], callback, [...path, index], root)
		}
	} else if (typeof value === 'object') {
		for (const key in value) {
			walk(value[key], callback, [...path, key], root)
		}
	}
}

const deleteEntity = ({ model, record, entityType, entityId }: { model: z.AnyZodObject; record: any; entityType: SiteEntityType | LibraryEntityType; entityId: string | number }): void => {
	// Delete the actual entity first
	delete record.data.entities[entityType][entityId]

	// Delete all references to the entity
	walk(record, (value, path) => {
		if (!value || typeof value !== 'object') {
			return
		}

		const valueType = walkToType(model, [...path, 0])
		const referenceType: SiteEntityType | LibraryEntityType | null = valueType[SITE_ENTITY_REFERENCE] ?? valueType[LIBRARY_ENTITY_REFERENCE] ?? null
		if (referenceType !== entityType) {
			return
		}

		for (const key in value) {
			const reference = value[key]
			if (!reference || typeof reference !== 'object' || !('$ref' in reference) || typeof reference.$ref !== 'string') {
				return
			}

			const pointer = reference.$ref
			const pointedPath = decodeUriFragmentIdentifier(pointer)
			const [referencedId] = pointedPath.slice(-1)
			if (referencedId === entityId) {
				if (Array.isArray(value)) {
					value.splice(+key, 1)
				} else {
					delete value[key]
				}
			}
		}
	})
}

const isIntegerString = (value: string) => value === parseInt(value).toString()
