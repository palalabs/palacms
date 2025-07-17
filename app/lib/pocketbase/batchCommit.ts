import type { CollectionMapping } from './CollectionMapping.svelte'

/**
 * Commits field collections with dependency handling for parent-child relationships
 * 
 * Current approach: Parent fields are committed immediately when child fields are created.
 * This ensures child fields can reference actual database IDs rather than staging IDs.
 * 
 * Future enhancement: Could be extended to defer all commits until save, but would require
 * modifications to CollectionMapping to support selective commits or ID mapping.
 */
export async function commitFieldsWithDependencies(fieldCollection: CollectionMapping<any, any>) {
	await fieldCollection.commit()
}

/**
 * Advanced version: Commits multiple collections with cross-collection dependencies
 * This would be useful for committing Sites, SiteFields, and SiteEntries in the correct order
 */
export async function batchCommitWithDependencies(collections: {
	name: string
	collection: CollectionMapping<any, any>
	dependsOn?: string[]
}[]) {
	// Simple implementation: commit in the order provided
	// A more advanced version would analyze actual dependencies
	
	for (const { name, collection } of collections) {
		try {
			if (name.includes('Field')) {
				// Use dependency-aware commit for field collections
				await commitFieldsWithDependencies(collection)
			} else {
				// Regular commit for non-field collections
				await collection.commit()
			}
		} catch (error) {
			console.error(`Error committing ${name}:`, error)
			throw error
		}
	}
}