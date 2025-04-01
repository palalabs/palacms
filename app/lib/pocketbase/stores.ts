import { Libraries, Sites, Users } from './collections'
import { createCollectionStore } from './CollectionStore'

export const library = createCollectionStore(Libraries)
export const site = createCollectionStore(Sites)
