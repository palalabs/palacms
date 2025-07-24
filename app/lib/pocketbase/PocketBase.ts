import type { User } from '$lib/common/models/User'
import PocketBase from 'pocketbase'

export const self = new PocketBase(import.meta.env.DEV ? 'http://127.0.0.1:8090' : '/')
// Disable auto-cancellation for debugging
self.autoCancellation(false)

export const marketplace = new PocketBase('https://marketplace.palacms.org')

export const user = () => {
	return self.authStore.record as unknown as User | undefined
}
