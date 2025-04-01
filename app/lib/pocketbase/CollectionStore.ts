import { z } from 'zod'
import { type ValidatedCollection } from './ValidatedCollection'
import { readonly, writable } from 'svelte/store'
import { JsonPointer } from 'json-ptr'

const updateIntervalMs = 1000

export const createCollectionStore = <T extends z.AnyZodObject>(collection: ValidatedCollection<T>) => {
	type Record = z.infer<T>

	let id = ''
	let record: Record | null = null
	let store = writable<Record | null>(null)

	const proxy = (value: object) =>
		new Proxy(value, {
			get(target, key) {
				let val = target[key]
				if (typeof key === 'symbol') {
					// Could be internal value that is not part of the JSON document
					return val
				}

				// Resolve reference
				if ('$ref' in val) {
					val = JsonPointer.get(record, target[key].$ref)
				}

				// Return proxy if val is object (or array)
				if (val && typeof val === 'object') {
					return proxy(val)
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

				store.update((proxiedValue) => {
					if ('$ref' in target[key]) {
						// Set through reference
						JsonPointer.set(record, target[key].$ref, val)
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
			if (id !== '' && record) {
				// TODO: JSON Patch
				collection.update(id, record).then((value) => {
					record = value
					store.set(proxy(record))
					updateTask = null
				})
			} else {
				updateTask = null
			}
		}, updateIntervalMs)
	}

	return Object.assign(readonly(store), {
		track(newId: string) {
			id = newId
			collection.getOne(id).then((value) => {
				record = value
				store.set(proxy(record))
			})
		},
		untrack() {
			id = ''
			record = null
			store.set(null)
		}
	})
}
