import type { default as PocketBase, RecordAuthResponse } from 'pocketbase'
import type { z } from 'zod'
import { self } from './PocketBase'
import { SvelteMap } from 'svelte/reactivity'
import { customAlphabet } from 'nanoid'
import { untrack } from 'svelte'

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

export type StagedOperation<T extends ObjectWithId> =
	| { operation: 'create'; processed: boolean; data: Omit<T, 'id'> }
	| { operation: 'update'; processed: boolean; data: Partial<T> }
	| { operation: 'delete'; processed: boolean }

export type CollectionMapping<T extends ObjectWithId, Options extends CollectionMappingOptions<T>> = {
	one: (id: string) => MappedObject<T, Options> | undefined
	list: (options?: ListOptions) => MappedObjectList<T, Options> | undefined
	create: (values: Omit<T, 'id'> & { id?: string }) => MappedObject<T, Options>
	update: (id: string, values: Partial<T>) => MappedObject<T, Options>
	delete: (id: string) => void
	commit: () => Promise<void>
	discard: () => void
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
			const operation = staged.get(id)
			let data = records.get(id)

			if (operation?.operation === 'delete') {
				return undefined
			} else if (operation) {
				data = Object.assign({}, data, operation.data)
			} else if (!data) {
				// If no cached record exists, start loading it
				if (!records.has(id)) {
					untrack(() => {
						records.set(id, undefined)
						collection
							.getOne(id)
							.then((record) => {
								records.set(id, record as unknown as T)
							})
							.catch((error) => {
								// Record doesn't exist, remove from cache
								records.delete(id)
							})
					})
				}
				return undefined
			}

			return mapObject(data)
		},
		list: (options) => {
			const listId = JSON.stringify(options ?? {})

			// If no cached list exists, start loading it
			if (!lists.has(listId)) {
				untrack(() => {
					lists.set(listId, undefined)
					collection
						.getFullList(options)
						.then((fetchedRecords) => {
							// Store the full records
							fetchedRecords.forEach((record) => {
								records.set(record.id, record as unknown as T)
							})
							// Store the list of IDs
							lists.set(
								listId,
								fetchedRecords.map(({ id }) => id)
							)
						})
						.catch((error) => {
							lists.set(listId, [])
						})
				})
			}

			const list = [...(lists.get(listId) ?? [])]
			for (const [id, value] of staged) {
				// Only add non-deleted staged items to the list
				if (value !== null && !list.includes(id)) {
					list.push(id)
				}
			}

			const objects = list.map((id) => collectionMapping.one(id)).filter((object) => object !== undefined)
			if (lists.get(listId) === undefined && objects.length === 0) {
				return undefined
			} else {
				return objects
			}
		},
		create: (values) => {
			const id = generateId()
			const data = { ...values, id }
			staged.set(id, { operation: 'create', processed: false, data })
			return mapObject(data)
		},
		update: (id, values) => {
			let operation = staged.get(id)
			if (operation && operation.operation !== 'delete') {
				// Create a new operation object to ensure reactivity
				const updatedOperation =
					// Separate (duplicate) cases for each operation type to satify TypeScript
					operation.operation == 'create'
						? {
								operation: operation.operation,
								processed: false,
								data: { ...operation.data, ...values }
							}
						: {
								operation: operation.operation,
								processed: false,
								data: { ...operation.data, ...values }
							}
				staged.set(id, updatedOperation)
			} else {
				operation = { operation: 'update', processed: false, data: values }
				staged.set(id, operation)
			}

			let data = records.get(id)
			data = Object.assign({}, data, operation.data)
			return mapObject(data)
		},
		delete: (id) => {
			const operation = staged.get(id)
			if (operation?.operation === 'create' && !operation.processed) {
				staged.delete(id)
			} else {
				staged.set(id, { operation: 'delete', processed: false })
			}
		},
		commit: async () => {
			const promises: Promise<void>[] = []
			for (const [id, operation] of staged) {
				// Avoid redoing operation if commit is done twice in a row
				if (operation.processed) {
					continue
				} else {
					operation.processed = true
				}

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
		discard: () => {
			staged.clear()
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
