import { readonly, writable, type Readable, type Unsubscriber } from 'svelte/store'
import { createCollectionStore } from '../pocketbase/CollectionStore'
import type { z } from 'zod'
import type { ValidatedCollection } from '../pocketbase/ValidatedCollection'
import { paramsMatch } from './utils'
import type { ID } from '$lib/common'
import type { Id } from '$lib/common/models/Id'
import type { Resolved } from '$lib/common/json'

export type CollectionStoreLoader<T extends z.AnyZodObject, P extends (string | number | undefined | null)[]> = {
	(...params: [...P]): Readable<Resolved<T, { [ID]: Id }> | null>
	refresh: () => void
}

export const createCollectionStoreLoader = <T extends z.AnyZodObject, P extends (string | number | undefined | null)[]>(
	collection: ValidatedCollection<T>,
	load: (...params: [...P]) => Promise<z.TypeOf<T> | string>
): CollectionStoreLoader<T, P> => {
	const store = writable<Resolved<T, { [ID]: Id }> | null>(null)
	let refresh: (() => void) | undefined
	let unsubscribe: Unsubscriber | undefined
	let loaded: boolean | P = false
	return Object.assign(
		(...params: P) => {
			if (typeof loaded === 'boolean' && loaded) {
				return readonly(store)
			} else if (Array.isArray(loaded) && paramsMatch(loaded, params)) {
				return readonly(store)
			}

			loaded = params.length ? params : true
			store.set(null)
			unsubscribe?.()
			load(...params).then((idOrRecord) => {
				const cs = createCollectionStore(collection, idOrRecord)
				refresh = cs.refresh
				unsubscribe = cs.subscribe((value) => store.set(value))
			})
			return readonly(store)
		},
		{
			refresh: () => {
				refresh?.()
			}
		}
	)
}
