import type { LibrarySymbol } from '$lib/common/models/LibrarySymbol'
import type { SiteSymbol } from '$lib/common/models/SiteSymbol'


/**
 * Export a symbol (library or site) to JSON format
 */
export async function exportSymbol(symbol: LibrarySymbol | SiteSymbol): Promise<void> {
	try {
		const fields = symbol.fields()
		const entries = symbol.entries()
		
		const symbolData = {
			name: symbol.name,
			html: symbol.html,
			css: symbol.css,
			js: symbol.js,
			fields: fields?.map(field => ({
				id: field.id,
				key: field.key,
				label: field.label,
				type: field.type,
				config: field.config,
				parent: field.parent,
				index: field.index
			})) || [],
			entries: entries?.map(entry => ({
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

/**
 * Import a symbol from JSON file - library version
 */
export async function importLibrarySymbol(
	file: File, 
	groupId: string,
	collections: {
		LibrarySymbols: any,
		LibrarySymbolFields: any,
		LibrarySymbolEntries: any
	}
): Promise<void> {
	if (!file) return
	
	try {
		const text = await file.text()
		const symbolData = JSON.parse(text)
		
		// Validate required fields
		if (!symbolData.name || typeof symbolData.name !== 'string') {
			throw new Error('Invalid symbol: missing or invalid name')
		}
		
		// Handle both old format (with code property) and new format (direct properties)
		let html = '', css = '', js = ''
		
		if (symbolData.code) {
			// Old format: symbol.code.html, symbol.code.css, symbol.code.js
			html = symbolData.code.html || ''
			css = symbolData.code.css || ''
			js = symbolData.code.js || ''
		} else {
			// New format: symbol.html, symbol.css, symbol.js
			html = symbolData.html || ''
			css = symbolData.css || ''
			js = symbolData.js || ''
		}
		
		// Generate unique name if symbol already exists in the group
		const existingSymbols = collections.LibrarySymbols.list()
		let finalName = symbolData.name
		let counter = 1
		
		while (existingSymbols?.find(s => s.name === finalName && s.group === groupId)) {
			finalName = `${symbolData.name} (${counter})`
			counter++
		}
		
		// Create symbol with validated data
		const createData = {
			name: finalName,
			html,
			css,
			js,
			group: groupId
		}
		
		const createdSymbol = collections.LibrarySymbols.create(createData)
		await collections.LibrarySymbols.commit()
		
		// Create fields and entries if they exist
		console.log('About to create fields for symbol:', createdSymbol?.id)
		console.log('Symbol data fields:', symbolData.fields?.length || 0)
		console.log('Symbol data entries:', symbolData.entries?.length || 0)
		
		await createSymbolFieldsAndEntries(
			createdSymbol,
			symbolData,
			collections.LibrarySymbolFields,
			collections.LibrarySymbolEntries
		)
		
		// Force collection to refresh and verify fields
		try {
			// Try different refresh methods
			if (typeof collections.LibrarySymbolFields.refresh === 'function') {
				await collections.LibrarySymbolFields.refresh()
				console.log('Collection refreshed using refresh() method')
			} else if (typeof collections.LibrarySymbolFields.reload === 'function') {
				await collections.LibrarySymbolFields.reload()
				console.log('Collection refreshed using reload() method')
			} else {
				console.log('No refresh/reload method found on collection')
			}
		} catch (e) {
			console.log('Failed to refresh collection:', e.message)
		}
		
		const symbolFields = collections.LibrarySymbolFields.list()?.filter(f => f.symbol === createdSymbol.id) || []
		console.log('Final verification - fields created for symbol:', symbolFields.length)
		if (symbolFields.length > 0) {
			console.log('Successfully created fields:', symbolFields.map(f => f.key).join(', '))
		} else {
			console.warn('No fields found in verification, but creation appeared successful')
		}
		
		console.log('Library symbol imported successfully:', finalName)
	} catch (error) {
		console.error('Failed to import library symbol:', error)
		throw error
	}
}

/**
 * Import a symbol from JSON file - site version
 */
export async function importSiteSymbol(
	file: File,
	siteId: string,
	collections: {
		SiteSymbols: any,
		SiteSymbolFields: any,
		SiteSymbolEntries: any
	}
): Promise<void> {
	if (!file) return
	
	try {
		const text = await file.text()
		const symbolData = JSON.parse(text)
		
		// Validate required fields
		if (!symbolData.name || typeof symbolData.name !== 'string') {
			throw new Error('Invalid symbol: missing or invalid name')
		}
		
		// Handle both old format (with code property) and new format (direct properties)
		let html = '', css = '', js = ''
		
		if (symbolData.code) {
			html = symbolData.code.html || ''
			css = symbolData.code.css || ''
			js = symbolData.code.js || ''
		} else {
			html = symbolData.html || ''
			css = symbolData.css || ''
			js = symbolData.js || ''
		}
		
		// Generate unique name if symbol already exists for this site
		const existingSymbols = collections.SiteSymbols.list()
		let finalName = symbolData.name
		let counter = 1
		
		while (existingSymbols?.find(s => s.name === finalName && s.site === siteId)) {
			finalName = `${symbolData.name} (${counter})`
			counter++
		}
		
		// Create symbol with validated data
		const createData = {
			name: finalName,
			html,
			css,
			js,
			site: siteId
		}
		
		const createdSymbol = collections.SiteSymbols.create(createData)
		await collections.SiteSymbols.commit()
		
		// Create fields and entries if they exist
		await createSymbolFieldsAndEntries(
			createdSymbol,
			symbolData,
			collections.SiteSymbolFields,
			collections.SiteSymbolEntries
		)
		
		console.log('Site symbol imported successfully:', finalName)
	} catch (error) {
		console.error('Failed to import site symbol:', error)
		throw error
	}
}

/**
 * Shared function to create fields and entries for imported symbols
 */
async function createSymbolFieldsAndEntries(
	createdSymbol: any,
	symbolData: any,
	FieldCollection: any,
	EntryCollection: any
): Promise<void> {
	console.log('createSymbolFieldsAndEntries called with:', {
		symbolId: createdSymbol?.id,
		fieldsCount: symbolData.fields?.length || 0,
		entriesCount: symbolData.entries?.length || 0
	})
	
	if (!symbolData.fields || symbolData.fields.length === 0) {
		console.log('No fields to create, returning early')
		return
	}
	
	const fieldIdMap = new Map()
	
	console.log('All fields from symbolData:', symbolData.fields)
	
	// Debug: Check parent values
	symbolData.fields.forEach(f => {
		console.log(`Field "${f.key}": parent = "${f.parent}" (type: ${typeof f.parent})`)
	})
	
	// Create fields in two passes: first parent fields, then child fields
	const parentFields = symbolData.fields.filter(f => !f.parent)
	const childFields = symbolData.fields.filter(f => f.parent)
	
	console.log('Parent fields:', parentFields.length, parentFields)
	console.log('Child fields:', childFields.length, childFields)
	
	// First pass: Create fields without parents
	for (const field of parentFields) {
		console.log('Creating parent field:', field)
		// Use existing field type or default to text if missing
		let fieldType = field.type || 'text'
		
		// Provide appropriate default config based on field type
		let config = field.config || {}
		if (!field.config) {
			switch (fieldType) {
				case 'select':
					config = { options: [] }
					break
				case 'repeater':
					config = {}
					break
				case 'image':
					config = {}
					break
				case 'url':
					config = {}
					break
				case 'link':
					config = {}
					break
				case 'icon':
					config = {}
					break
				case 'number':
					config = {}
					break
				case 'slider':
					config = { min: 0, max: 100, step: 1 }
					break
				case 'switch':
					config = {}
					break
				case 'group':
					config = {}
					break
				case 'page':
					config = {}
					break
				case 'page-list':
					config = {}
					break
				case 'site-field':
					config = {}
					break
				case 'page-field':
					config = {}
					break
				case 'markdown':
					config = {}
					break
				case 'info':
					config = {}
					break
				case 'text':
					config = {}
					break
				default:
					config = {}
			}
		}
		
		const fieldData = {
			key: field.key,
			label: field.label,
			type: fieldType,
			config,
			parent: undefined,
			index: field.index || 0,
			symbol: createdSymbol.id
		}

		try {
			console.log('Creating field with data:', fieldData)
			const result = FieldCollection.create(fieldData)
			console.log('Field create result:', result)

			// Map old field ID to new field ID - use the result directly
			if (result?.id) {
				fieldIdMap.set(field.id, result.id)
				console.log('Mapped parent field:', field.id, '->', result.id, 'key:', field.key)
			} else {
				console.error('No field ID returned from create for field:', field.key)
			}
		} catch (fieldError) {
			console.error('Failed to create parent field:', field.key, fieldError)
		}
	}
	
	// Commit all parent fields at once
	if (parentFields.length > 0) {
		console.log('Committing all parent fields...')
		await FieldCollection.commit()
		console.log('Parent fields committed successfully')
		
		// Debug: Check if fields are immediately available after commit
		const immediateCheck = FieldCollection.list()?.filter(f => f.symbol === createdSymbol.id)
		console.log('Immediate post-commit check - fields found:', immediateCheck?.length || 0)
		
		// Try checking individual field IDs
		const createdFieldIds = Array.from(fieldIdMap.values())
		console.log('Created field IDs to check:', createdFieldIds)
		for (const fieldId of createdFieldIds) {
			try {
				const field = FieldCollection.one(fieldId)
				console.log('Field check by ID:', fieldId, field ? 'EXISTS' : 'NOT FOUND')
			} catch (e) {
				console.log('Field check by ID:', fieldId, 'ERROR:', e.message)
			}
		}
	}

	// Second pass: Create fields with parents
	for (const field of childFields) {
		const newParentId = fieldIdMap.get(field.parent)
		
		if (newParentId) {
			// Use existing field type or default to text if missing
			let fieldType = field.type || 'text'
			
			// Provide appropriate default config based on field type
			let config = field.config || {}
			if (!field.config) {
				switch (fieldType) {
					case 'select':
						config = { options: [] }
						break
					case 'repeater':
						config = {}
						break
					case 'image':
						config = {}
						break
					case 'url':
						config = {}
						break
					case 'link':
						config = {}
						break
					case 'icon':
						config = {}
						break
					case 'number':
						config = {}
						break
					case 'slider':
						config = { min: 0, max: 100, step: 1 }
						break
					case 'switch':
						config = {}
						break
					case 'group':
						config = {}
						break
					case 'page':
						config = {}
						break
					case 'page-list':
						config = {}
						break
					case 'site-field':
						config = {}
						break
					case 'page-field':
						config = {}
						break
					case 'markdown':
						config = {}
						break
					case 'info':
						config = {}
						break
					case 'text':
						config = {}
						break
					default:
						config = {}
				}
			}
			
			const fieldData = {
				key: field.key,
				label: field.label,
				type: fieldType,
				config,
				parent: newParentId,
				index: field.index || 0,
				symbol: createdSymbol.id
			}

			try {
				const result = FieldCollection.create(fieldData)

				// Map old field ID to new field ID - use the result directly
				if (result?.id) {
					fieldIdMap.set(field.id, result.id)
					console.log('Mapped child field:', field.id, '->', result.id)
				}
			} catch (fieldError) {
				console.warn('Failed to create child field:', field.key, fieldError)
			}
		}
	}
	
	// Commit all child fields at once
	if (childFields.length > 0) {
		console.log('Committing all child fields...')
		await FieldCollection.commit()
		console.log('Child fields committed successfully')
	}
	
	// Skip entries completely - focus on field structure only
	console.log('ENTRIES SKIPPED: Import complete - fields created but no entries imported')
	console.log(`Total entries in export: ${symbolData.entries?.length || 0} (all skipped)`)
}