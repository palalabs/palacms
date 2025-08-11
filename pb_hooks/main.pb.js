/// <reference path="../pb_data/types.d.ts" />

// Auto-copy page type sections when creating a new page
onRecordCreate((e) => {
	// Only handle pages collection
	if (e.record?.collection()?.name !== 'pages') {
		e.next()
		return
	}

	const pageTypeId = e.record.get('page_type')
	if (!pageTypeId) {
		e.next()
		return
	}

	// Get the page type and its sections
	const pageType = $app.findRecordById('page_types', pageTypeId)
	if (!pageType) {
		e.next()
		return
	}

	// Find all sections for this page type (all zones: header, body, footer)
	const pageTypeSections = $app.findRecordsByFilter(
		'page_type_sections',
		`page_type = {:pageTypeId}`,
		'index',
		500,
		0,
		{ pageTypeId }
	)

	// After the page is created, copy all sections
	e.next()

	// Copy each page type section to the new page
	for (const pts of pageTypeSections) {
		// Create the page section
		const pageSectionData = new Record($app.findCollectionByNameOrId('page_sections'))
		pageSectionData.set('page', e.record.id)
		pageSectionData.set('symbol', pts.get('symbol'))
		pageSectionData.set('index', pts.get('index'))
		$app.save(pageSectionData)

		// Find and copy only root-level entries (parent = null/empty)
		const pageTypeSectionEntries = $app.findRecordsByFilter(
			'page_type_section_entries',
			`section = {:sectionId} && parent = null`,
			'',
			500,
			0,
			{ sectionId: pts.id }
		)

		for (const ptse of pageTypeSectionEntries) {
			const entryData = new Record($app.findCollectionByNameOrId('page_section_entries'))
			entryData.set('section', pageSectionData.id)
			entryData.set('field', ptse.get('field'))
			entryData.set('locale', ptse.get('locale'))
			entryData.set('value', ptse.get('value'))
			entryData.set('index', ptse.get('index'))
			// Don't set parent since we're only copying root-level entries
			$app.save(entryData)
		}
	}
}, 'pages')

onRecordValidate((e) => {
	if (!e.record) {
		e.next()
		return
	}

	// Select model for validation
	const { models } = require(__hooks + '/common/index.cjs')
	const collection = e.record.collection()
	const model = models[collection.name]
	if (!model) {
		e.next()
		return
	}

	// Gather and parse values
	const values = {}
	for (const field of collection.fields) {
		const name = field.getName()
		let value = e.record.get(name)
		if (field.type() === 'json') {
			value = JSON.parse(value.string())
		}
		if (field.type() === 'file') {
			// File fields are validated as strings of filenames
			value = Array.isArray(value) ? value.map((file) => file.name ?? '') : (value.name ?? '')
		}
		values[name] = value
	}

	// Validate
	try {
		model.parse(values)
	} catch (error) {
		console.error(error)
		throw new ValidationError()
	}

	e.next()
})

routerAdd('GET', '/admin/{path...}', $apis.static('./pb_public', true))

routerAdd('GET', '/{path...}', (e) => {
	// Handle missing trailing slash
	if (e.request.url.path.slice(-1) !== '/') {
		return e.redirect(301, e.request.url.path + '/')
	}

	const host = e.request.host
	const path = e.request.pathValue('path').slice(0, -1).split('/')
	const finalSlug = path[path.length - 1]

	// Find the target page by slug
	const [page] = $app.findRecordsByFilter('pages', `site.host = {:host} && slug = {:slug}`, 'id', 1, 0, { host, slug: finalSlug || null })
	if (!page && !finalSlug) {
		// Homepage not found, redirect to site editor
		return e.redirect(302, '/admin')
	} else if (!page) {
		return e.notFoundError('Page not found')
	}

	// Check that path is correct
	let current = page
	for (const segment of [...path].reverse().slice(1)) {
		current = $app.findRecordById('pages', current.get('parent'))
		if (current.get('slug') !== segment) {
			return e.notFoundError('Page not found')
		}
	}

	// Respond with compiled HTML
	const fileKey = page.baseFilesPath() + '/' + page.get('compiled_html')
	let fsys, reader, content
	try {
		fsys = $app.newFilesystem()
		reader = fsys.getFile(fileKey)
		content = toString(reader)
		return e.blob(200, 'text/html', content)
	} finally {
		reader?.close()
		fsys?.close()
	}
})

routerAdd('GET', '/_preview/{site}', (e) => {
	const siteId = e.request.pathValue('site')
	let site
	try {
		site = $app.findRecordById('sites', siteId)
	} catch {
		return e.string(404, 'Site not found')
	}

	// Respond with compiled HTML
	const fileKey = site.baseFilesPath() + '/' + site.get('preview')
	let fsys, reader, content
	try {
		fsys = $app.newFilesystem()
		reader = fsys.getFile(fileKey)
		content = toString(reader)
		return e.blob(200, 'text/html', content)
	} catch {
		return e.string(404, 'Preview not found')
	} finally {
		reader?.close()
		fsys?.close()
	}
})

routerAdd('GET', '/_symbols/{filename}', (e) => {
	const filename = e.request.pathValue('filename')

	// Filename must end with .js
	if (!filename.endsWith('.js')) {
		return e.notFoundError('File not found')
	}

	// Find symbol
	const symbolId = filename.slice(0, -'.js'.length)
	const symbol = $app.findRecordById('site_symbols', symbolId)

	// Respond with compiled JavaScript
	const fileKey = symbol.baseFilesPath() + '/' + symbol.get('compiled_js')
	let fsys, reader, content
	try {
		fsys = $app.newFilesystem()
		reader = fsys.getFile(fileKey)
		content = toString(reader)
		return e.blob(200, 'text/javascript', content)
	} finally {
		reader?.close()
		fsys?.close()
	}
})
