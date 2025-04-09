import { SiteGroup } from '$lib/common/models/SiteGroup'
import { Libraries, SiteGroups, Sites } from '$lib/pocketbase/collections'
import { createStoreLoader } from '$lib/loaders/StoreLoader'
import { createCollectionStoreLoader } from './CollectionStoreLoader'
import type { Site } from '$lib/common/models/Site'
import type { Id } from '$lib/common/models/Id'

export const require_marketplace_symbol_groups = createStoreLoader(() => fetch('https://weave-marketplace.vercel.app/api/symbol_groups').then((response) => response.json()), [])
export const require_marketplace_symbols = createStoreLoader((group_id: number) => fetch(`https://weave-marketplace.vercel.app/api/symbol_groups/${group_id}`).then((response) => response.json()), [])
export const require_marketplace_starters = createStoreLoader(() => fetch('https://weave-marketplace.vercel.app/api/starters').then((response) => response.json()), [])
export const require_site_groups = createStoreLoader<SiteGroup[]>(() => SiteGroups.getFullList(), [])
export const require_site_list = createStoreLoader<Pick<Site, 'id' | 'name' | 'description' | 'group' | 'index'>[], [Id | null]>(
	(site_group_id) => Sites.getFullList({ filter: site_group_id ? `group.id = "${site_group_id}"` : undefined, fields: 'id, name, description, group, index' }),
	[]
)
export const require_library = createCollectionStoreLoader(Libraries, () => Libraries.getList(0, 1).then(([record]) => record))
export const require_site = createCollectionStoreLoader(Sites, async (site_id: string) => site_id)
