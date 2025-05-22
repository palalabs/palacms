import type { RecordAuthResponse } from 'pocketbase'
import type { z } from 'zod'
import { pb } from './PocketBase'
import { SvelteMap } from 'svelte/reactivity'

export type ListOptions = {
	sort?: string
	filter?: string
}

export type ObjectWithId = { id: string }

export type CollectionMappingOptions<T extends ObjectWithId> = {
	links: Record<string, (this: MappedObject<T, { links: {} }>) => unknown>
}

export type MappedObject<T extends ObjectWithId, Options extends CollectionMappingOptions<T>> = T & Options['links']

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
}

export const createCollectionMapping = <T extends ObjectWithId, Options extends CollectionMappingOptions<T>>(
	idOrName: string,
	model: z.ZodType<T>,
	options?: Options
): CollectionMapping<T, Options> => {
	const collection = pb.collection(idOrName)
	const objects = new SvelteMap<string, MappedObject<T, Options>>()
	const lists = new SvelteMap<string, MappedObjectList<T, Options>>()
	const mapObject = (record: unknown): MappedObject<T, Options> => {
		const object = model.parse(record)
		const links = Object.fromEntries(Object.entries(options?.links ?? {}).map(([property, factory]) => [property, factory.bind(object)]))
		return Object.assign(object, links)
	}

	return {
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
		}
	}
}
