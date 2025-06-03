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

export type MappedObject<T extends ObjectWithId, Options extends CollectionMappingOptions<T>> = T & NonNullable<Options['links']> & { collection: CollectionMapping<T, CollectionMappingOptions<T>> }

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
	instance: PocketBase
}

export const createCollectionMapping = <T extends ObjectWithId, Options extends CollectionMappingOptions<T>>(name: string, model: z.ZodType<T>, options?: Options): CollectionMapping<T, Options> => {
	const instance = options?.instance ?? self
	const instanceCache = new Map<PocketBase, CollectionMapping<T, Options>>()
	const collection = instance.collection(name)
	const objects = new SvelteMap<string, MappedObject<T, Options> | undefined>()
	const lists = new SvelteMap<string, string[] | undefined>()
	const mapObject = (record: unknown): MappedObject<T, Options> => {
		const object = model.parse(record)
		const links = Object.fromEntries(Object.entries(options?.links ?? {}).map(([property, factory]) => [property, factory.bind({ ...object, collection: collectionMapping })]))
		return Object.assign(object, links, { collection: collectionMapping })
	}

	const collectionMapping: CollectionMapping<T, Options> = {
		one: (id) => {
			$effect.pre(() => {
				if (!objects.has(id)) {
					objects.set(id, undefined)
					collection.getOne(id).then((record) => {
						objects.set(id, mapObject(record))
					})
				}
			})

			return objects.get(id)
		},
		list: (options) => {
			const listId = $derived(JSON.stringify(options ?? {}))
			$effect.pre(() => {
				if (!lists.has(listId)) {
					lists.set(listId, undefined)
					collection.getFullList({ ...options, fields: 'id' }).then((records) => {
						lists.set(
							listId,
							records.map(({ id }) => id)
						)
					})
				}
			})

			return (lists.get(listId) ?? []).map((id) => collectionMapping.one(id)).filter((object) => object !== undefined)
		},
		create: async (values) => {
			const record = await collection.create(values)
			const object = mapObject(record)
			objects.set(record.id, object)
			lists.clear()
			return object
		},
		update: async (id, values) => {
			const record = await collection.update(id, values)
			const object = mapObject(record)
			objects.set(id, object)
			return object
		},
		delete: async (id) => {
			await collection.delete(id)
			objects.delete(id)
			lists.clear()
		},
		authWithPassword: async (usernameOrEmail, password) => {
			const response = await collection.authWithPassword(usernameOrEmail, password)
			const object = mapObject(response.record)
			objects.set(response.record.id, object)
			return { ...response, record: object }
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
		},
		instance
	}

	instanceCache.set(instance, collectionMapping)
	return collectionMapping
}
