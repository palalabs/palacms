import type { User } from '$lib/common/models/User'
import PocketBase from 'pocketbase'

export const pb = new PocketBase(import.meta.env.DEV ? 'http://127.0.0.1:8090' : '/')

export const user = () => {
	return pb.authStore.record as unknown as User | undefined
}
