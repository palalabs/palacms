import { get_empty_value } from './builder/utils'
import type { SiteSymbolEntry } from './common/models/SiteSymbolEntry'
import type { SiteSymbolField } from './common/models/SiteSymbolField'
import { LibrarySymbolEntries, LibrarySymbolFields, LibrarySymbolGroups, LibrarySymbols, manager, Sites, SiteSymbolEntries, SiteSymbolFields, SiteSymbols } from './pocketbase/collections'
import { useSvelteWorker } from './Worker.svelte'

const createImportWorker =
	(collections: {
		Symbols: typeof SiteSymbols | typeof LibrarySymbols
		Fields: typeof SiteSymbolFields | typeof LibrarySymbolFields
		Entries: typeof SiteSymbolEntries | typeof LibrarySymbolEntries
	}) =>
	(file?: File, targetId?: string) => {
		const worker = useSvelteWorker(
			() => !!file && !!targetId,
			() => !!existingSymbols,
			async () => {
				const text = (await file?.text()) || ''
				const importData = JSON.parse(text)

				// Validate required fields
				if (!importData.name || typeof importData.name !== 'string') {
					throw new Error('Invalid symbol: missing or invalid name')
				}

				// Handle both old format (with code property) and new format (direct properties)
				let html = '',
					css = '',
					js = ''

				if (importData.code) {
					html = importData.code.html || ''
					css = importData.code.css || ''
					js = importData.code.js || ''
				} else {
					html = importData.html || ''
					css = importData.css || ''
					js = importData.js || ''
				}

				// Generate unique name if symbol already exists for this site
				let finalName = importData.name
				let counter = 1

				while (existingSymbols?.find((s) => s.name === finalName && ('site' in s ? s.site === targetId : s.group === targetId))) {
					finalName = `${importData.name} (${counter})`
					counter++
				}

				// Create symbol with validated data
				const createData = {
					name: finalName,
					html,
					css,
					js,
					site: targetId ?? '',
					group: targetId ?? ''
				}

				const symbol = collections.Symbols.create(createData)

				const symbol_field_map = new Map<string, SiteSymbolField>()
				const create_symbol_fields = (parent_field_import_id?: string) => {
					for (const symbol_field_import of importData.fields) {
						if (parent_field_import_id ? symbol_field_import.parent !== parent_field_import_id : symbol_field_import.parent) {
							continue
						}

						const parent = symbol_field_import.parent ? symbol_field_map.get(symbol_field_import.parent) : undefined
						if (symbol_field_import.parent && !parent) {
							throw new Error('No parent symbol field')
						}

						// Use existing field type or default to text if missing
						let fieldType = symbol_field_import.type || 'text'

						// Provide appropriate default config based on field type
						let config = symbol_field_import.config || { condition: symbol_field_import.condition }
						if (!symbol_field_import.config) {
							switch (fieldType) {
								case 'select':
									config = { ...config, options: symbol_field_import.options?.options || [] }
									break
								case 'repeater':
									config = { ...config }
									break
								case 'image':
									config = { ...config }
									break
								case 'url':
									config = { ...config }
									break
								case 'link':
									config = { ...config }
									break
								case 'icon':
									config = { ...config }
									break
								case 'number':
									config = { ...config }
									break
								case 'slider':
									config = { ...config, min: 0, max: 100, step: 1 }
									break
								case 'switch':
									config = { ...config }
									break
								case 'group':
									config = { ...config }
									break
								case 'page':
									config = { ...config }
									break
								case 'page-list':
									config = { ...config }
									break
								case 'site-field':
									config = { ...config }
									break
								case 'page-field':
									config = { ...config }
									break
								case 'markdown':
									config = { ...config }
									break
								case 'info':
									config = { ...config }
									break
								case 'text':
									config = { ...config }
									break
								default:
									config = { ...config }
							}
						}

						const fieldData = {
							key: symbol_field_import.key,
							label: symbol_field_import.label,
							type: fieldType,
							config,
							parent: parent?.id,
							index: symbol_field_import.index || 0,
							symbol: symbol.id
						}

						const field = collections.Fields.create(fieldData)
						symbol_field_map.set(symbol_field_import.id, field)
						create_symbol_fields(symbol_field_import.id)
					}
				}
				create_symbol_fields()

				const symbol_entry_map = new Map<string, SiteSymbolEntry>()
				const create_symbol_entries = (parent_entry_import_id?: string) => {
					for (const symbol_entry_import of importData.entries) {
						if (parent_entry_import_id ? symbol_entry_import.parent !== parent_entry_import_id : symbol_entry_import.parent) {
							continue
						}

						const field = symbol_field_map.get(symbol_entry_import.field)
						if (!field) {
							throw new Error('No symbol field for symbol entry')
						}

						const parent = symbol_entry_import.parent ? symbol_entry_map.get(symbol_entry_import.parent) : undefined
						if (symbol_entry_import.parent && !parent) {
							throw new Error('No parent symbol entry')
						}

						const entry = collections.Entries.create({
							locale: symbol_entry_import.locale || 'en',
							index: symbol_entry_import.index || 0,
							field: field.id,
							parent: parent?.id,
							value: symbol_entry_import.value || get_empty_value(field)
						})
						symbol_entry_map.set(symbol_entry_import.id, entry)
						create_symbol_entries(symbol_entry_import.id)
					}
				}
				create_symbol_entries()

				await manager.commit()
				console.log('Symbol imported successfully:', finalName)
			}
		)

		const shouldLoad = $derived(['loading', 'working'].includes(worker.status))
		const existingSymbols = $derived(shouldLoad ? collections.Symbols.list() : undefined)

		return worker
	}

export const useImportSiteSymbol = createImportWorker({ Symbols: SiteSymbols, Fields: SiteSymbolFields, Entries: SiteSymbolEntries })
export const useImportLibrarySymbol = createImportWorker({ Symbols: LibrarySymbols, Fields: LibrarySymbolFields, Entries: LibrarySymbolEntries })
