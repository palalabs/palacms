import { z } from 'zod'
import { type ValidatedCollection } from './ValidatedCollection'
import { readonly, writable } from 'svelte/store'
import { resolve, type Resolved } from '../common/json'
import type { ID } from '$lib/common'
import type { Id } from '$lib/common/models/Id'

const updateIntervalMs = 1000

export const createCollectionStore = <T extends z.AnyZodObject>(collection: ValidatedCollection<T>, idOrRecord: string | z.infer<T>) => {
	type Record = z.infer<T>
	type ResolvedRecord = Resolved<T>

	let record: Record | null = null
	let store = writable<ResolvedRecord | null>(null)

	let updateTask: NodeJS.Timeout | null = null
	const onUpdate = () => {
		store.update((value) => value)
		if (updateTask !== null) {
			return
		}
		updateTask = setTimeout(() => {
			if (record) {
				// TODO: JSON Patch
				collection.update(record.id, record).then((value) => {
					record = value
					const resolved = resolve(collection.model, record, onUpdate) as ResolvedRecord
					store.set(resolved)
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
			const resolved = resolve(collection.model, record, onUpdate) as ResolvedRecord
			store.set(resolved)
		})
	}
	if (typeof idOrRecord === 'string') {
		refresh()
	} else {
		record = idOrRecord
		const resolved = resolve(collection.model, record, onUpdate) as ResolvedRecord
		store.set(resolved)
	}

	return Object.assign(readonly(store), { refresh })
}

export type CollectionStore<T extends z.AnyZodObject> = ReturnType<typeof createCollectionStore<T>>
