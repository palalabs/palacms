import type { default as PocketBase, RecordAuthResponse } from 'pocketbase'
import type { z } from 'zod'
import { self } from './PocketBase'
import { SvelteMap } from 'svelte/reactivity'

export type ListOptions = {
	sort?: string
	filter?: string
}

export type ObjectOf<T> = T extends CollectionMapping<infer Object, infer Options> ? MappedObject<Object, Options> : never

export type ObjectWithId = { id: string }

export type CollectionMappingOptions<T extends ObjectWithId> = {
	instance?: PocketBase
	links?: Record<string, (this: MappedObject<T, { links: {} }>) => unknown>
}

export type MappedObject<T extends ObjectWithId, Options extends CollectionMappingOptions<T>> = T & NonNullable<Options['links']> & { _instance: PocketBase }

export type MappedObjectList<T extends ObjectWithId, Options extends CollectionMappingOptions<T>> = MappedObject<T, Options>[]

export type CollectionMapping<T extends ObjectWithId, Options extends CollectionMappingOptions<T>> = {
	one: (id: string) => MappedObject<T, Options> | undefined
	list: (options?: ListOptions) => MappedObjectList<T, Options>
	create: (values: Omit<T, 'id'> & { id?: string }) => Promise<MappedObject<T, Options>>
	update: (id: string, values: Partial<T>) => Promise<MappedObject<T, Options>>
	delete: (id: string) => Promise<void>
	authWithPassword: (usernameOrEmail: string, password: string) => Promise<RecordAuthResponse<MappedObject<T, Options>>>
	requestPasswordReset: (email: string) => Promise<void>
	confirmPasswordReset: (passwordResetToken: string, password: string, passwordConfirm: string) => Promise<void>
	from: (instance: PocketBase) => CollectionMapping<T, Options>
}

export const createCollectionMapping = <T extends ObjectWithId, Options extends CollectionMappingOptions<T>>(name: string, model: z.ZodType<T>, options?: Options): CollectionMapping<T, Options> => {
	const instance = options?.instance ?? self
	const instanceCache = new Map<PocketBase, CollectionMapping<T, Options>>()
	const collection = instance.collection(name)
	const objects = new SvelteMap<string, MappedObject<T, Options>>()
	const lists = new SvelteMap<string, MappedObjectList<T, Options>>()
	const mapObject = (record: unknown): MappedObject<T, Options> => {
		const object = model.parse(record)
		const links = Object.fromEntries(Object.entries(options?.links ?? {}).map(([property, factory]) => [property, factory.bind({ ...object, _instance: instance })]))
		return Object.assign(object, links, { _instance: instance })
	}

	const collectionMapping: CollectionMapping<T, Options> = {
		one: (id) => {
			if (!objects.has(id)) {
				collection.getOne(id).then((record) => {
					objects.set(id, mapObject(record))
				})
			}
			return objects.get(id)
		},
		list: (options) => {
			const listId = JSON.stringify(options ?? {})
			if (!lists.has(listId)) {
				collection.getFullList(options).then((records) => {
					const list = records.map(mapObject)
					lists.set(listId, list)
					for (const one of list) {
						objects[one.id] = one
					}
				})
			}
			return lists.get(listId) ?? []
		},
		create: async (values) => {
			const record = await collection.create(values)
			objects[record.id] = mapObject(record)

			const theOne = $derived(objects[record.id])
			return theOne
		},
		update: async (id, values) => {
			const record = await collection.update(id, values)
			objects[id] = mapObject(record)

			const theOne = $derived(objects[record.id])
			return theOne
		},
		delete: async (id) => {
			await collection.delete(id)
			delete objects[id]
		},
		authWithPassword: async (usernameOrEmail, password) => {
			const response = await collection.authWithPassword(usernameOrEmail, password)
			objects[response.record.id] = mapObject(response.record)

			const theOne = $derived(objects[response.record.id])
			return {
				...response,
				record: theOne
			}
		},
		requestPasswordReset: async (email) => {
			await collection.requestPasswordReset(email)
		},
		confirmPasswordReset: async (passwordResetToken, password, passwordConfirm) => {
			await collection.confirmPasswordReset(passwordResetToken, password, passwordConfirm)
		},
		from: (instance: PocketBase) => {
			const cachedCollectionMapping = instanceCache.get(instance)
			if (cachedCollectionMapping) {
				return cachedCollectionMapping
			}
			const collectionMapping = createCollectionMapping(name, model, { ...options, instance })
			instanceCache.set(instance, collectionMapping)
			return collectionMapping
		}
	}

	instanceCache.set(instance, collectionMapping)
	return collectionMapping
}
