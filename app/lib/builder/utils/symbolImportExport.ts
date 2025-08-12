import type { ObjectOf } from '$lib/pocketbase/CollectionMapping'
import { type LibrarySymbols, type SiteSymbols } from '$lib/pocketbase/collections'

/**
 * Export a symbol (library or site) to JSON format
 */
export async function exportSymbol(symbol: ObjectOf<typeof LibrarySymbols> | ObjectOf<typeof SiteSymbols>): Promise<void> {
	try {
		const fields = 'site' in symbol ? symbol.fields() : symbol.fields()
		const entries = 'site' in symbol ? symbol.entries() : symbol.entries()

		const symbolData = {
			name: symbol.name,
			html: symbol.html,
			css: symbol.css,
			js: symbol.js,
			fields:
				fields?.map((field) => ({
					id: field.id,
					key: field.key,
					label: field.label,
					type: field.type,
					config: field.config,
					parent: field.parent,
					index: field.index
				})) || [],
			entries:
				entries?.map((entry) => ({
					id: entry.id,
					locale: entry.locale,
					field: entry.field,
					value: entry.value
				})) || []
		}

		const blob = new Blob([JSON.stringify(symbolData, null, 2)], { type: 'application/json' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = `${symbol.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
		URL.revokeObjectURL(url)
	} catch (error) {
		console.error('Failed to export symbol:', error)
		throw error
	}
}
