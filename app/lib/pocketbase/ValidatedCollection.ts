import { z } from 'zod'
import type { RecordAuthResponse, RecordFullListOptions, RecordListOptions, RecordModel } from 'pocketbase'
import { pb } from './PocketBase'

export type ValidatedCollection<T extends z.AnyZodObject> = {
	getOne: (id: string) => Promise<z.TypeOf<T>>
	getList: (page?: number, perPage?: number, options?: RecordListOptions) => Promise<z.TypeOf<T>[]>
	getFullList: (options?: RecordFullListOptions) => Promise<z.TypeOf<T>[]>
	create: (values: Omit<z.TypeOf<T>, 'id'> & { id?: string }) => Promise<z.TypeOf<T>>
	update: (id: string, values: Partial<z.TypeOf<T>>) => Promise<z.TypeOf<T>>
	delete: (id: string) => Promise<boolean>
	authWithPassword: (usernameOrEmail: string, password: string) => Promise<RecordAuthResponse<z.TypeOf<T>>>
	requestPasswordReset: (email: string) => Promise<boolean>
	confirmPasswordReset: (passwordResetToken: string, password: string, passwordConfirm: string) => Promise<boolean>
}

export const createValidatedCollection = <T extends z.AnyZodObject>(idOrName: string, schema: T): ValidatedCollection<T> => {
	const collection = pb.collection(idOrName)
	const schemaWithOptionalId = schema.extend({ id: z.string().nonempty().optional() })
	return {
		getOne: async (id) => {
			const record = await collection.getOne(id)
			return schema.parse(record)
		},
		getList: async (page, perPage, options) => {
			const result = await collection.getList(page, perPage, options)
			return result.items.map((record) => schema.parse(record))
		},
		getFullList: async (options) => {
			const records = await collection.getFullList(options)
			return records.map((record) => schema.parse(record))
		},
		create: async (values) => {
			const input = schemaWithOptionalId.parse(values)
			const record = await collection.create(input)
			const output = schema.parse(record)
			return output
		},
		update: async (id, values) => {
			const input = schema.partial().parse(values)
			const record = await collection.update(id, input)
			const output = schema.parse(record)
			return output
		},
		delete: (id) => collection.delete(id),
		authWithPassword: async (usernameOrEmail, password) => {
			const response = await collection.authWithPassword(usernameOrEmail, password)
			return {
				...response,
				record: schema.parse(response.record)
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
