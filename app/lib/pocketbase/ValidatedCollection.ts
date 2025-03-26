import type { z } from 'zod'
import type { RecordFullListOptions, RecordListOptions, RecordModel } from 'pocketbase'
import { pb } from './PocketBase'

export const createValidatedCollection = <T extends z.AnyZodObject>(idOrName: string, schema: T) => {
	type Values = z.TypeOf<T>
	type Record = RecordModel & Values
	const collection = pb.collection<Record>(idOrName)
	return {
		getOne: async (id: string): Promise<Values> => {
			const record = await collection.getOne(id)
			return schema.parse(record)
		},
		getList: async (page?: number, perPage?: number, options?: RecordListOptions): Promise<Values[]> => {
			const result = await collection.getList(page, perPage, options)
			return result.items.map((record) => schema.parse(record))
		},
		getFullList: async (options?: RecordFullListOptions): Promise<Values[]> => {
			const records = await collection.getFullList(options)
			return records.map((record) => schema.parse(record))
		},
		create: async (values: Values): Promise<Values> => {
			const input = schema.parse(values)
			const record = await collection.create(input)
			const output = schema.parse(record)
			return output
		},
		update: async (id: string, values: Partial<Values>): Promise<Values> => {
			const input = schema.partial().parse(values)
			const record = await collection.update(id, input)
			const output = schema.parse(record)
			return output
		},
		delete: (id: string) => collection.delete(id),
		authWithPassword: (usernameOrEmail: string, password: string) => collection.authWithPassword(usernameOrEmail, password),
		requestPasswordReset: (email: string) => collection.requestPasswordReset(email),
		confirmPasswordReset: (passwordResetToken: string, password: string, passwordConfirm: string) => collection.confirmPasswordReset(passwordResetToken, password, passwordConfirm)
	}
}
