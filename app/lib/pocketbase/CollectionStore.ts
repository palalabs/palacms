import { z } from 'zod'
import { type ValidatedCollection } from './ValidatedCollection'
import { readonly, writable } from 'svelte/store'
import { JsonPointer } from 'json-ptr'
import { SITE_ENTITY_REFERENCE, type SiteEntityType } from '$lib/common/models/SiteEntityReference'
import type { Site } from '$lib/common/models/Site'
import { LIBRARY_ENTITY_REFERENCE, type LibraryEntityType } from '$lib/common/models/LibraryEntityReference'
import type { Library } from '$lib/common/models/Library'
import { v4 as uuid } from 'uuid'
import { ID } from '$lib/common'
import { newId } from '$lib/common/models/Id'

const updateIntervalMs = 1000

type RequiredProperties<T extends Record<string, unknown>> = { [K in keyof T]: T extends undefined ? never : K }[keyof T]
type OptionalProperties<T extends Record<string, unknown>> = { [K in keyof T]: T extends undefined ? K : never }[keyof T]

export type Resolved<T extends z.ZodTypeAny> = T extends {
	[SITE_ENTITY_REFERENCE]: SiteEntityType
}
	? Resolved<(typeof Site)['shape']['data']['shape']['entities']['shape'][T[typeof SITE_ENTITY_REFERENCE]]['element']>
	: T extends {
				[LIBRARY_ENTITY_REFERENCE]: LibraryEntityType
		  }
		? Resolved<(typeof Library)['shape']['data']['shape']['entities']['shape'][T[typeof LIBRARY_ENTITY_REFERENCE]]['element']>
		: T extends z.AnyZodObject
			? {
					[K in RequiredProperties<T['_output']>]: Resolved<T['shape'][K]>
				} & {
					[K in OptionalProperties<T['_output']>]?: Resolved<T['shape'][K]>
				}
			: T extends z.ZodArray<z.ZodTypeAny>
				? Resolved<T['element']>[]
				: T extends z.ZodRecord<z.ZodString, z.ZodTypeAny>
					? Record<string, Resolved<T['element']>>
					: T extends z.ZodRecord<z.ZodNumber, z.ZodTypeAny>
						? Record<number, Resolved<T['element']>>
						: T extends z.ZodUnion<infer Types>
							? { [K in keyof Types]: Resolved<Types[K]> }[number]
							: T['_output']

const walkToType = (model: z.ZodTypeAny, path: string[]): z.ZodTypeAny => {
	if (path.length === 0) {
		return model
	}

	const [key, ...restOfPath] = path
	if (model instanceof z.ZodObject) {
		return walkToType(model.shape[key], restOfPath)
	} else if (model instanceof z.ZodArray || model instanceof z.ZodRecord) {
		return walkToType(model.element, restOfPath)
	} else if (model instanceof z.ZodUnion) {
		return z.union(
			model.options
				.map((model: z.ZodTypeAny) => {
					try {
						return walkToType(model, [key, ...restOfPath])
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

export const createCollectionStore = <T extends z.AnyZodObject>(collection: ValidatedCollection<T>, idOrRecord: string | z.infer<T>) => {
	type Record = z.infer<T>
	type ResolvedRecord = Resolved<T>

	let record: Record | null = null
	let store = writable<ResolvedRecord | null>(null)

	const proxy = (value: object, path: string[] = []): any =>
		new Proxy(value, {
			get(target, key) {
				const [propertyKey, id] = path.slice(-2)
				if (propertyKey === 'entities' && key === ID) {
					return id
				}

				let val = target[key]
				if (typeof key === 'symbol') {
					// Could be internal value that is not part of the JSON document
					return val
				}

				// Resolve reference
				if (val && typeof val === 'object' && '$ref' in val) {
					val = JsonPointer.get(record, target[key].$ref)
				}

				// Return proxy if val is object (or array)
				if (val && typeof val === 'object') {
					return proxy(val, [...path, key])
				} else {
					return val
				}
			},
			set(target, key, val) {
				if (typeof key === 'symbol') {
					// Could be internal value that is not part of the JSON document
					target[key] = val
					return true
				}

				const valueType = walkToType(collection.model, [...path, key])
				const referenceType: SiteEntityType | LibraryEntityType | null = valueType[SITE_ENTITY_REFERENCE] ?? valueType[LIBRARY_ENTITY_REFERENCE] ?? null
				store.update((proxiedValue) => {
					if (!record) return proxiedValue
					if (referenceType && !(key in target)) {
						const id = newId()
						record.data.entities[referenceType][id] = val
						target[key] = { $ref: `#/data/entities/${referenceType}/${id}` }
						scheduleUpdate()
						return proxiedValue
					} else {
						// Set directly
						target[key] = val
						scheduleUpdate()
						return proxiedValue
					}
				})
				return true
			}
		})

	let updateTask: NodeJS.Timeout | null = null
	const scheduleUpdate = () => {
		if (updateTask !== null) {
			return
		}
		updateTask = setTimeout(() => {
			if (record) {
				// TODO: JSON Patch
				collection.update(record.id, record).then((value) => {
					record = value
					store.set(proxy(record))
					updateTask = null
				})
			} else {
				updateTask = null
			}
		}, updateIntervalMs)
	}

	const refresh = () => {
		const id = typeof idOrRecord === 'string' ? idOrRecord : idOrRecord.id
		collection.getOne(id).then((value) => {
			record = value
			store.set(proxy(record))
		})
	}
	if (typeof idOrRecord === 'string') {
		refresh()
	} else {
		record = idOrRecord
		store.set(proxy(record))
	}

	return Object.assign(readonly(store), { refresh })
}

export type CollectionStore<T extends z.AnyZodObject> = ReturnType<typeof createCollectionStore<T>>
