import { readonly, writable, type Readable } from 'svelte/store'
import { paramsMatch } from './utils'

export type StoreLoader<T, P extends (string | number | undefined | null)[] = []> = {
	(...params: [...P]): Readable<T>
	refresh: () => void
}

export const createStoreLoader = <T, P extends (string | number | undefined | null)[] = []>(load: (...params: [...P]) => Promise<T>, defaultValue?: T): StoreLoader<T, P> => {
	const store = writable(defaultValue)
	let loaded: boolean | P = false
	return Object.assign(
		(...params: P) => {
			if (typeof loaded === 'boolean' && loaded) {
				return readonly(store)
			} else if (Array.isArray(loaded) && paramsMatch(loaded, params)) {
				return readonly(store)
			}

			loaded = params.length ? params : true
			load(...params).then((value) => store.set(value))
			return readonly(store)
		},
		{
			refresh: () => {
				if (!loaded) return
				if (loaded === true) {
					load(...([] as unknown as P)).then((value) => store.set(value))
				} else {
					load(...loaded).then((value) => store.set(value))
				}
			}
		}
	)
}
