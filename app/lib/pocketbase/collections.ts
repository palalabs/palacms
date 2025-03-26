import { User } from '$lib/common/models/User'
import { createValidatedCollection } from './ValidatedCollection'

export const Users = createValidatedCollection('users', User)
