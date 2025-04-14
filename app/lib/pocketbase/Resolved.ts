import { z } from 'zod'
import { decodeUriFragmentIdentifier, JsonPointer } from 'json-ptr'
import { SITE_ENTITY_REFERENCE, type SiteEntityType } from '$lib/common/models/SiteEntityReference'
import type { Site } from '$lib/common/models/Site'
import { LIBRARY_ENTITY_REFERENCE, type LibraryEntityType } from '$lib/common/models/LibraryEntityReference'
import type { Library } from '$lib/common/models/Library'
import { ID } from '$lib/common'
import { Id, newId } from '$lib/common/models/Id'

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

export const serialize = <T extends z.AnyZodObject>(model: T, value: Omit<Resolved<T>, 'id'>): z.TypeOf<T> => {
	const record = {}
	serializeRecursive<T>({ value, model, record, result: record })
	return record
}

const serializeRecursive = <T extends z.AnyZodObject>({ value, model, record, result, path = [] }: { value: object; model: T; result: any; record: any; path?: string[] }): void => {
	for (const key in value) {
		if (value[key] && typeof value[key] === 'object') {
			const valueType = walkToType(model, [...path, key])
			const referenceType: SiteEntityType | LibraryEntityType | null = valueType[SITE_ENTITY_REFERENCE] ?? valueType[LIBRARY_ENTITY_REFERENCE] ?? null

			if (referenceType) {
				// Set reference
				if (!record.data) record.data = {}
				if (!record.data.entities) record.data.entities = {}
				if (!record.data.entities[referenceType]) record.data.entities[referenceType] = {}
				const id = value[key][ID] ?? newId()
				record.data.entities[referenceType][id] = serializeRecursive({ value: value[key], model, record, result: {}, path: ['data', 'entities', referenceType, id] })
				result[key] = { $ref: `#/data/entities/${referenceType}/${id}` }
				continue
			} else if (Array.isArray(value[key])) {
				// Set array, overwriting if already in result
				result[key] = []
				serializeRecursive({ value: value[key], model, record, result: result[key], path: [...path, key] })
			} else {
				// Set object, merging if exists already in result
				result[key] = result[key] ?? {}
				result[key] = serializeRecursive({ value: value[key], model, record, result: result[key], path: [...path, key] })
				continue
			}
		}

		if (!(key in result)) {
			// Set directly without overwriting
			result[key] = value[key]
			continue
		}
	}
	return result
}

const proxy = ({ value, model, record, path = [], onUpdate }: { value: object; model: z.AnyZodObject; record: any; path?: (string | number)[]; onUpdate?: () => void }): any =>
	new Proxy(value, {
		get(target, key) {
			const [propertyKey, _entityType, id] = path.slice(-3)
			if (propertyKey === 'entities' && key === ID) {
				return id
			}

			let val = target[key]
			if (typeof key === 'symbol') {
				// Could be internal value that is not part of the JSON document
				return val
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
			if (val && typeof val === 'object') {
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
			const [propertyKey] = path.slice(-2)
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
			if (referenceType && !(key in target)) {
				const id = newId()
				record.data.entities[referenceType][id] = val
				target[key] = { $ref: `#/data/entities/${referenceType}/${id}` }
				onUpdate?.()
				return true
			} else {
				// Set directly
				target[key] = val
				onUpdate?.()
				return true
			}
		}
	})

const walkToType = (model: z.ZodTypeAny | undefined, path: (string | number)[], root?: z.ZodTypeAny): z.ZodTypeAny => {
	root = root ?? model
	if (!model) {
		return z.unknown()
	}
	if (path.length === 0) {
		return model
	}

	const [key, ...restOfPath] = path
	const referenceType: SiteEntityType | LibraryEntityType | null = model[SITE_ENTITY_REFERENCE] ?? model[LIBRARY_ENTITY_REFERENCE] ?? null
	if (referenceType) {
		// Walk through reference
		model = walkToType(root, ['data', 'entities', referenceType, key], root)
		return walkToType(model, restOfPath, root)
	} else if (model instanceof z.ZodObject) {
		return walkToType(model.shape[key], restOfPath, root)
	} else if (model instanceof z.ZodArray) {
		if (!isIntegerString(key.toString())) {
			return z.unknown()
		}
		return walkToType(model.element, restOfPath, root)
	} else if (model instanceof z.ZodRecord) {
		if (!model.keySchema.safeParse(key).success) {
			return z.unknown()
		}
		return walkToType(model.element, restOfPath, root)
	} else if (model instanceof z.ZodUnion) {
		return z.union(
			model.options
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

const isIntegerString = (value: string) => value === parseInt(value).toString()
