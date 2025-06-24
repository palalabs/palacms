import type { default as PocketBase, RecordAuthResponse } from 'pocketbase'
import type { z } from 'zod'
import { self } from './PocketBase'
import { SvelteMap } from 'svelte/reactivity'
import { customAlphabet } from 'nanoid'

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

export type StagedOperation<T extends ObjectWithId> = { operation: 'create'; data: Omit<T, 'id'> } | { operation: 'update'; data: Partial<T> } | { operation: 'delete' }

export type CollectionMapping<T extends ObjectWithId, Options extends CollectionMappingOptions<T>> = {
	one: (id: string) => MappedObject<T, Options> | undefined
	list: (options?: ListOptions) => MappedObjectList<T, Options>
	create: (values: Omit<T, 'id'> & { id?: string }) => MappedObject<T, Options>
	update: (id: string, values: Partial<T>) => MappedObject<T, Options>
	delete: (id: string) => void
	commit: () => Promise<void>
	refresh: () => void
	authWithPassword: (usernameOrEmail: string, password: string) => Promise<RecordAuthResponse<MappedObject<T, Options>>>
	requestPasswordReset: (email: string) => Promise<void>
	confirmPasswordReset: (passwordResetToken: string, password: string, passwordConfirm: string) => Promise<void>
	from: (instance: PocketBase) => CollectionMapping<T, Options>
	instance: PocketBase
}

const generateId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 15)

export const createCollectionMapping = <T extends ObjectWithId, Options extends CollectionMappingOptions<T>>(name: string, model: z.ZodType<T>, options?: Options): CollectionMapping<T, Options> => {
	const instance = options?.instance ?? self
	const instanceCache = new Map<PocketBase, CollectionMapping<T, Options>>()
	const collection = instance.collection(name)
	const staged = new SvelteMap<string, StagedOperation<T>>()
	const records = new SvelteMap<string, T | undefined>()
	const lists = new SvelteMap<string, string[] | undefined>()
	const mapObject = (record: unknown): MappedObject<T, Options> => {
		const object = model.parse(record)
		const links = Object.fromEntries(Object.entries(options?.links ?? {}).map(([property, factory]) => [property, factory.bind({ ...object, collection: collectionMapping })]))
		return Object.assign(object, links, { collection: collectionMapping })
	}

	const collectionMapping: CollectionMapping<T, Options> = {
		one: (id) => {
			$effect.pre(() => {
				if (!records.has(id) && !staged.has(id)) {
					records.set(id, undefined)
					collection.getOne(id).then((record) => {
						records.set(id, record as unknown as T)
					})
				}
			})

			let data = records.get(id)
			const operation = staged.get(id)
			if (operation?.operation === 'delete') {
				return undefined
			} else if (operation) {
				data = Object.assign({}, data, operation.data)
			} else if (!data) {
				return undefined
			}
			return mapObject(data)
		},
		list: (options) => {
			const listId = JSON.stringify(options ?? {})
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

			const list = lists.get(listId) ?? []
			for (const [id] of staged) {
				if (!list.includes(id)) {
					list.push(id)
				}
			}

			return list.map((id) => collectionMapping.one(id)).filter((object) => object !== undefined)
		},
		create: (values) => {
			const id = generateId()
			const data = { ...values, id }
			staged.set(id, { operation: 'create', data })
			return mapObject(data)
		},
		update: (id, values) => {
			let operation = staged.get(id)
			if (operation && operation.operation !== 'delete') {
				Object.assign(operation.data, values)
				staged.set(id, operation)
			} else {
				operation = { operation: 'update', data: values }
				staged.set(id, operation)
			}

			let data = records.get(id)
			data = Object.assign({}, data, operation.data)
			return mapObject(data)
		},
		delete: (id) => {
			const operation = staged.get(id)
			if (operation?.operation === 'create') {
				staged.delete(id)
			} else {
				staged.set(id, { operation: 'delete' })
			}
		},
		commit: async () => {
			const promises: Promise<void>[] = []
			for (const [id, operation] of staged) {
				switch (operation.operation) {
					case 'create':
						promises.push(
							collection.create(operation.data).then((record) => {
								records.set(id, record as unknown as T)
							})
						)
						break

					case 'update':
						promises.push(
							collection.update(id, operation.data).then((record) => {
								records.set(id, record as unknown as T)
							})
						)
						break

					case 'delete':
						promises.push(
							collection.delete(id).then(() => {
								records.delete(id)
							})
						)
						break
				}
			}

			await Promise.all(promises)
			staged.clear()
			lists.clear()
		},
		refresh: () => {
			// Force refresh lists without clearing objects immediately
			refreshLists()
		},
		authWithPassword: async (usernameOrEmail, password) => {
			const response = await collection.authWithPassword(usernameOrEmail, password)
			records.set(response.record.id, response.record as unknown as T)
			return { ...response, record: mapObject(response.record) }
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
