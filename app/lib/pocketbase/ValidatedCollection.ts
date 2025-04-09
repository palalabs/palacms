import { z } from 'zod'
import type { CommonOptions, ListOptions, RecordAuthResponse, RecordFullListOptions, RecordListOptions, RecordOptions } from 'pocketbase'
import { pb } from './PocketBase'
import { serialize, type Resolved } from './Resolved'

export type ValidatedCollection<T extends z.AnyZodObject> = {
	model: z.AnyZodObject
	getOne: (id: string) => Promise<z.TypeOf<T>>
	getList: (page?: number, perPage?: number, options?: RecordListOptions) => Promise<z.TypeOf<T>[]>
	getFullList: (options?: RecordFullListOptions) => Promise<z.TypeOf<T>[]>
	create: (values: Omit<Resolved<T>, 'id'> & { id?: string }) => Promise<z.TypeOf<T>>
	update: (id: string, values: Partial<z.TypeOf<T>>) => Promise<z.TypeOf<T>>
	delete: (id: string) => Promise<boolean>
	authWithPassword: (usernameOrEmail: string, password: string) => Promise<RecordAuthResponse<z.TypeOf<T>>>
	requestPasswordReset: (email: string) => Promise<boolean>
	confirmPasswordReset: (passwordResetToken: string, password: string, passwordConfirm: string) => Promise<boolean>
}

export const createValidatedCollection = <T extends z.AnyZodObject>(idOrName: string, model: T): ValidatedCollection<T> => {
	const collection = pb.collection(idOrName)
	const schemaWithOptionalId = model.extend({ id: z.string().nonempty().optional() })
	const getModel = (options?: RecordOptions) => {
		let transformedModel: z.AnyZodObject = model
		if (options?.fields) {
			const fields = Object.fromEntries(options?.fields?.split(',').map((f) => [f.trim(), true as const]))
			transformedModel = model.pick(fields)
		}
		return transformedModel
	}

	return {
		model,
		getOne: async (id) => {
			const record = await collection.getOne(id)
			return model.parse(record)
		},
		getList: async (page, perPage, options) => {
			const transformedModel = getModel(options)
			const result = await collection.getList(page, perPage, options)
			return result.items.map((record) => transformedModel.parse(record))
		},
		getFullList: async (options) => {
			const transformedModel = getModel(options)
			const records = await collection.getFullList(options)
			return records.map((record) => transformedModel.parse(record))
		},
		create: async (values) => {
			const serialized = serialize(model, values)
			const input = schemaWithOptionalId.parse(serialized)
			const record = await collection.create(input)
			const output = model.parse(record)
			return output
		},
		update: async (id, values) => {
			const input = model.partial().parse(values)
			const record = await collection.update(id, input)
			const output = model.parse(record)
			return output
		},
		delete: (id) => collection.delete(id),
		authWithPassword: async (usernameOrEmail, password) => {
			const response = await collection.authWithPassword(usernameOrEmail, password)
			return {
				...response,
				record: model.parse(response.record)
			}
		},
		requestPasswordReset: (email) => {
			return collection.requestPasswordReset(email)
		},
		confirmPasswordReset: (passwordResetToken, password, passwordConfirm) => {
			return collection.confirmPasswordReset(passwordResetToken, password, passwordConfirm)
		}
	}
}
