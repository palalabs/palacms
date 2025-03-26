import type { User } from '$lib/common/models/User'
import PocketBase from 'pocketbase'

export const pb = new PocketBase(import.meta.env.DEV ? 'http://127.0.0.1:8090' : '/')

export const user = () => {
	const user = pb.authStore.record
	if (!user) {
		throw new Error('No user')
	}
	return user as unknown as User
}
