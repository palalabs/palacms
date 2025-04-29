import { z } from 'zod'
import { decodeUriFragmentIdentifier, JsonPointer } from 'json-ptr'
import type { Site, SiteEntityType } from '../models/Site'
import { type LibraryEntityType } from '../models/LibraryEntityReference'
import type { Library } from '../models/Library'
import { ID } from '../constants'
import { newId } from '../models/Id'
import { ENTITY_REFERENCE_TYPE, type EntityReference } from '../models/EntityReference'
import { ENTITY_TYPE } from '../models/Entity'

type RequiredProperties<T extends Record<string, unknown>> = { [K in keyof T]-?: undefined extends T[K] ? never : K }[keyof T]
type OptionalProperties<T extends Record<string, unknown>> = { [K in keyof T]-?: undefined extends T[K] ? K : never }[keyof T]

export type Resolved<T extends z.ZodTypeAny> =
	T extends z.ZodType<EntityReference<infer EntityType extends SiteEntityType>>
		? Resolved<(typeof Site)['shape']['data']['shape']['entities']['shape'][EntityType]['element']>
		: T extends z.ZodType<EntityReference<infer EntityType extends LibraryEntityType>>
			? Resolved<(typeof Library)['shape']['data']['shape']['entities']['shape'][EntityType]['element']>
			: T extends z.AnyZodObject
				? {
						[K in RequiredProperties<T['_output']>]: Resolved<T['shape'][K]>
					} & {
						[K in OptionalProperties<T['_output']>]?: Resolved<T['shape'][K]>
					}
				: T extends z.ZodArray<infer Element>
					? Resolved<Element>[]
					: T extends z.ZodRecord<infer Key, infer Element>
						? Record<z.TypeOf<Key>, Resolved<Element>>
						: T extends z.ZodUnion<infer Options>
							? { [K in keyof Options]: Resolved<Options[K]> }[number]
							: T extends z.ZodDiscriminatedUnion<string, infer Options>
								? { [K in keyof Options]: Resolved<Options[K]> }[number]
								: T extends z.ZodEffects<infer InnerType>
									? Resolved<InnerType>
									: T['_output']

export const resolve = <T extends z.AnyZodObject>(model: T, value: z.TypeOf<T>, onUpdate?: () => void): Resolved<T> => proxy({ value, model, record: value, onUpdate })

export const normalize = <T extends z.AnyZodObject>(model: T, value: Omit<Resolved<T>, 'id'>): z.TypeOf<T> => {
	const record = {}
	normalizeRecursive<T>({ value, model, record, result: record })
	return record
}

const normalizeRecursive = <T extends z.AnyZodObject>({ value, model, record, result, path = [] }: { value: object; model: T; result: any; record: any; path?: (string | number)[] }): void => {
	for (const key in value) {
		if (value[key] && typeof value[key] === 'object') {
			const valueTypes = walkToType(model, [...path, key])
			const modelEntityTypes = getEntityTypesFromModel(valueTypes)
			let entityType = getEntityTypeFromValue(value[key])
			if (modelEntityTypes || entityType) {
				if (!entityType && modelEntityTypes && modelEntityTypes.length === 1) {
					entityType = modelEntityTypes[0]
				} else if (!entityType || !modelEntityTypes || !modelEntityTypes.includes(entityType)) {
					throw new Error('Cannot determine the type of entity reference')
				}

				// Update entity through reference
				if (!record.data) record.data = {}
				if (!record.data.entities) record.data.entities = {}
				if (!record.data.entities[entityType]) record.data.entities[entityType] = {}
				const entityId = value[key][ID] ?? (value[key][ID] = newId())
				const entity = record.data.entities[entityType][entityId] ?? {}
				record.data.entities[entityType][entityId] = entity
				normalizeRecursive({ value: value[key], model, record, result: entity, path: ['data', 'entities', entityType, entityId] })
				result[key] = { $ref: `#/data/entities/${entityType}/${entityId}`, [ENTITY_REFERENCE_TYPE]: entityType }
				continue
			} else if (Array.isArray(value[key])) {
				// Update array
				result[key] = result[key] ?? {}
				normalizeRecursive({ value: value[key], model, record, result: result[key], path: [...path, key] })
				continue
			} else {
				// Update object
				result[key] = result[key] ?? {}
				normalizeRecursive({ value: value[key], model, record, result: result[key], path: [...path, key] })
				continue
			}
		} else {
			// Set directly
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

			let value = target[key]
			if (typeof key === 'symbol') {
				// Could be internal value that is not part of the JSON document
				return value
			}

			if (value === undefined) {
				return undefined
			}

			// Resolve reference
			let innerPath = [...path, key]
			if (typeof value === 'object' && '$ref' in value && typeof value.$ref === 'string') {
				const pointer = value.$ref
				value = JsonPointer.get(record, pointer)
				innerPath = decodeUriFragmentIdentifier(pointer)
			}

			// Return proxy if val is object (or array)
			if (typeof value === 'object') {
				return proxy({
					value: value,
					model,
					record,
					path: innerPath,
					onUpdate
				})
			} else {
				return value
			}
		},
		set(target, key, value) {
			const [propertyKey, _entityType, _entityId] = path.slice(-3)
			if (propertyKey === 'entities' && key === ID) {
				throw new Error('Cannot set ID, it is virtual')
			}

			if (typeof key === 'symbol') {
				// Could be internal value that is not part of the JSON document
				target[key] = value
				return true
			}

			const valueTypes = walkToType(model, [...path, key])
			const modelEntityTypes = getEntityTypesFromModel(valueTypes)
			let entityType = getEntityTypeFromValue(value)
			if (modelEntityTypes || entityType) {
				if (!entityType && modelEntityTypes && modelEntityTypes.length === 1) {
					entityType = modelEntityTypes[0]
				} else if (!entityType || !modelEntityTypes || !modelEntityTypes.includes(entityType)) {
					throw new Error('Cannot determine the type of entity reference')
				}

				// Overwrite entity
				const entityId = value[ID] ?? (value[ID] = newId())
				const entity = {}
				normalizeRecursive({ value, model, record, result: entity, path: ['data', 'entities', entityType, entityId] })
				record.data.entities[entityType][entityId] = entity
				target[key] = { $ref: `#/data/entities/${entityType}/${entityId}`, [ENTITY_REFERENCE_TYPE]: entityType }
				onUpdate?.()
				return true
			} else if (Array.isArray(value)) {
				// Overwrite array
				target[key] = []
				normalizeRecursive({ value, model, record, result: target[key], path: [...path, key] })
				onUpdate?.()
				return true
			} else if (typeof value === 'object') {
				// Overwrite object
				target[key] = {}
				normalizeRecursive({ value, model, record, result: target[key], path: [...path, key] })
				onUpdate?.()
				return true
			} else {
				// Set directly
				target[key] = value
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
			const modelEntityTypes = getEntityTypesFromModel(valueType)
			const [propertyKey, entityType] = path.slice(-2)
			if (modelEntityTypes) {
				const pointer = target[key].$ref
				const pointedPath = decodeUriFragmentIdentifier(pointer)
				const [entityType, entityId] = pointedPath.slice(-2)
				deleteEntity({ model, record, entityType: entityType as SiteEntityType | LibraryEntityType, entityId })
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

const walkToType = (type: z.ZodTypeAny | undefined, path: (string | number)[], root?: z.ZodTypeAny): z.ZodTypeAny[] => {
	root = root ?? type
	if (!type) {
		return []
	}

	const entityTypes = getEntityTypesFromModel([type])
	if (entityTypes && path.length === 0) {
		// We don't want to map entity that is type of union. So let's just return it.
		return [type]
	} else if (type instanceof z.ZodUnion || type instanceof z.ZodDiscriminatedUnion) {
		return type.options.flatMap((type: z.ZodTypeAny) => {
			try {
				return walkToType(type, path, root)
			} catch {
				return []
			}
		})
	}

	const entityType = type[ENTITY_REFERENCE_TYPE]
	if (entityType) {
		return walkToType(root, ['data', 'entities', entityType, 'ENTITY_ID', ...path], root)
	} else if (type instanceof z.ZodBranded) {
		return walkToType(type.unwrap(), path, root)
	} else if (type instanceof z.ZodEffects) {
		return walkToType(type.innerType(), path, root)
	}

	if (path.length === 0) {
		return [type]
	}

	const [key, ...restOfPath] = path
	if (type instanceof z.ZodObject) {
		return walkToType(type.shape[key], restOfPath, root)
	} else if (type instanceof z.ZodArray) {
		if (!isIntegerString(key.toString())) {
			return []
		}
		return walkToType(type.element, restOfPath, root)
	} else if (type instanceof z.ZodRecord) {
		if (!type.keySchema.safeParse(key).success) {
			return []
		}
		return walkToType(type.element, restOfPath, root)
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
		const modelEntityTypes = getEntityTypesFromModel(valueType)
		if (!modelEntityTypes?.includes(entityType)) {
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

const getEntityTypesFromModel = (zodTypes: z.ZodTypeAny[]): string[] | null => {
	const types = zodTypes.map((type) => type[ENTITY_TYPE]).filter((type: string | undefined) => !!type)
	if (types.length === 0) {
		return null
	} else {
		return types
	}
}

const getEntityTypeFromValue = (value: unknown): string | null => {
	if (value && typeof value === 'object') {
		return value[ENTITY_TYPE] ?? null
	} else {
		return null
	}
}
