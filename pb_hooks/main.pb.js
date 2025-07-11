/// <reference path="../pb_data/types.d.ts" />

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
