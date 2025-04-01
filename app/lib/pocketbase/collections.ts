import { Site } from '$lib/common/models/Site'
import { SiteGroup } from '$lib/common/models/SiteGroup'
import { User } from '$lib/common/models/User'
import { createValidatedCollection } from './ValidatedCollection'
import { Library } from '$lib/common/models/Library'

export const Users = createValidatedCollection('users', User)
export const LibrarySettings = createValidatedCollection('libraries', Library)
export const SiteGroups = createValidatedCollection('site_groups', SiteGroup)
export const Sites = createValidatedCollection('sites', Site)
