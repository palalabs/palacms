import { Library } from './Library'
import { Site } from './Site'
import { SiteGroup } from './SiteGroup'
import { User } from './User'

/**
 * Model for each collection. Used in a PocketBase hook to validate records.
 */
export const models = {
	users: User,
	libraries: Library,
	site_groups: SiteGroup,
	sites: Site
} satisfies Record<string, import('zod').AnyZodObject>
