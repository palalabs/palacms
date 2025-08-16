import { rollup } from '@rollup/browser'
import svelteWorker from './svelte.worker?worker'
import PromiseWorker from 'promise-worker'
import registerPromiseWorker from 'promise-worker/register'
import * as resolve from 'resolve.exports'
import commonjs from './plugins/commonjs'
import json from './plugins/json'
import glsl from './plugins/glsl'

const sveltePromiseWorker = new PromiseWorker(new svelteWorker())

// Based on https://github.com/pngwn/REPLicant & the Svelte REPL package (https://github.com/sveltejs/sites/tree/master/packages/repl)

const CDN_URL = 'https://esm.sh' // or 'https://cdn.jsdelivr.net/npm' or 'https://unpkg.com'

registerPromiseWorker(rollup_worker)
async function rollup_worker({ component, head, hydrated, buildStatic = true, css = 'external', format = 'esm', dev_mode = false }) {
	const final = {
		ssr: '',
		dom: '',
		error: null
	}

	const component_lookup = new Map()

	const App_Wrapper = (components, head) => {
		const field_keys = Object.entries(head.data).filter((field) => field[0])
		return `
			<svelte:head>
				${head.code}
			</svelte:head>
			<script>
			  let props = $props();

				${components.map((_, i) => `import Component_${i} from './Component_${i}.svelte';`).join('\n')}
				${components.map((_, i) => `let { component_${i}_props } = props;`).join(`\n`)}

				let { head_props } = props;
				${field_keys.map((field) => `let ${field[0]} = head_props['${field[0]}'];`).join(`\n`)}
			</script>
			${components.map((component, i) => `<Component_${i} {...component_${i}_props} /> \n`).join('')}
		`
	}

	const Component = (component) => {
		let { html, css, js, data } = component

		// Move <svelte:window> outside the encompassing <div> to prevent 'can't nest' error
		if (html.includes('<svelte:window')) {
			let [svelteWindowTag] = html.match(/<svelte:window(.*?)\/>/)
			html = html.replace(svelteWindowTag, '')
			html = html + svelteWindowTag
		}

		const field_keys = Object.keys(data).filter((key) => !!key)

		// html must come first for LoC (inspector) to work
		return `\
					${html}
          <script>
            ${`let { ${field_keys.join(', ')} } = $props();` /* e.g. let { heading, body } = $props(); */}
            ${js}
          </script>
          ${css ? `<style>${css}</style>` : ``}`
	}

	function generate_lookup(component, head) {
		if (Array.isArray(component)) {
			// build page (sections as components)
			component.forEach((section, i) => {
				const code = Component(section)
				component_lookup.set(`./Component_${i}.svelte`, code)
			})
			component_lookup.set(`./App.svelte`, App_Wrapper(component, head))
		} else {
			// build individual component
			const app_code = Component(component)
			component_lookup.set(`./App.svelte`, app_code)
		}
	}

	generate_lookup(component, head)

	if (buildStatic) {
		const bundle = await compile({
			generate: 'server',
			css: 'injected',
			runes: true
		})

		const output = (await bundle.generate({ format })).output[0].code
		final.ssr = output
	} else {
		const bundle = await compile({
			generate: 'client',
			css,
			dev: dev_mode,
			runes: true
		})

		const output = (await bundle.generate({ format })).output[0].code
		final.dom = output
	}

	// If static build needs to be hydrated, include Svelte JS (or just render normal component)
	if (hydrated) {
		const bundle = await compile({
			generate: 'client',
			css: 'external',
			runes: true
		})
		const output = (await bundle.generate({ format })).output[0].code
		final.dom = output
	}

	async function compile(svelteOptions = {}) {
		return await rollup({
			input: './App.svelte',
			external: (id) => {
				if (/^https?:/.test(id)) return true
			},
			plugins: [
				commonjs,
				{
					name: 'repl-plugin',
					async resolveId(importee, importer) {
						// handle imports from 'svelte'

						// import x from 'svelte'
						if (importee === 'svelte') return `${CDN_URL}/svelte`

						// import x from 'svelte/somewhere'
						if (importee.startsWith('svelte/')) {
							return `${CDN_URL}/${importee}`
						}

						// import x from './file.js' (via a 'svelte' or 'svelte/x' package)
						if (importer && importer.startsWith(CDN_URL + '/')) {
							if (importee.startsWith(CDN_URL + '/')) {
								return importee
							}

							if (importee.startsWith('/')) {
								return `${CDN_URL}${importee}`
							}
						}

						// local repl components
						if (component_lookup.has(importee)) return importee

						// relative imports from a remote package
						if (importee.startsWith('.')) {
							return new URL(importee, importer).href
						}

						// importing from a URL
						if (/^https?:/.test(importee)) return importee

						const match = /^((?:@[^/]+\/)?[^/]+)(\/.+)?$/.exec(importee)
						if (!match) {
							return console.error(`Invalid import "${importee}"`)
						}

						const pkg_name = match[1]
						const subpath = `.${match[2] ?? ''}`

						const fetch_package_info = async () => {
							try {
								const pkg_url = await follow_redirects(`${CDN_URL}/${pkg_name}/package.json`)

								if (!pkg_url) throw new Error()

								const pkg_json = (await fetch_if_uncached(pkg_url))?.body
								const pkg = JSON.parse(pkg_json ?? '""')

								const pkg_url_base = pkg_url.replace(/\/package\.json$/, '')

								return {
									pkg,
									pkg_url_base
								}
							} catch (_e) {
								throw new Error(`Error fetching "${pkg_name}" from unpkg. Does the package exist?`)
							}
						}

						const { pkg, pkg_url_base } = await fetch_package_info()

						try {
							const resolved_id = await resolve_from_pkg(pkg, subpath, pkg_url_base)
							const final = resolved_id ? new URL(resolved_id + '', `${pkg_url_base}/`).href : pkg_url_base
							return final
						} catch (reason) {
							throw new Error(`Cannot import "${importee}": ${reason}.`)
						}
					},
					async load(id) {
						// local repl components are stored in memory
						// this is our virtual filesystem
						if (component_lookup.has(id)) return component_lookup.get(id)

						// everything else comes from a cdn
						let res = await fetch_if_uncached(id)
						return res?.body
					},
					async transform(code, id) {
						// our only transform is to compile svelte components
						//@ts-ignore
						if (!/.*\.svelte/.test(id)) return null

						try {
							const res = await sveltePromiseWorker.postMessage({
								code,
								svelteOptions
							})
							return res.code

							// TODO: reinstate warnings, pass along to UI instead of throwing
							// const warnings = res.warnings
							// 	.filter((w) => !w.message.startsWith(`Component has unused export`))
							// 	.filter((w) => !w.message.startsWith(`A11y: <img> element should have an alt attribute`))
							// 	.filter((w) => w.code !== `a11y-missing-content`)
							// 	.filter((w) => !w.message.startsWith(`Unused CSS selector`)) // TODO: reinstate
							// if (warnings[0]) {
							// 	final.error = warnings[0].message
							// 	return ''
							// } else {
							// 	return res.code
							// }
						} catch (e) {
							final.error = e.toString()
							return ''
						}
					}
				},
				json,
				glsl
				// replace({
				//   'process.env.NODE_ENV': JSON.stringify('production'),
				// }),
			]
			// inlineDynamicImports: true
		})
	}

	return final
}

/**
 * @param {string} url
 */
async function follow_redirects(url) {
	const res = await fetch_if_uncached(url)
	return res?.url
}

/** @type {Map<string, Promise<{ url: string; body: string; }>>} */
const FETCH_CACHE = new Map()

/**
 * @param {string} url
 */
async function fetch_if_uncached(url) {
	if (FETCH_CACHE.has(url)) {
		return FETCH_CACHE.get(url)
	}

	// cache bust for files in local dev
	if (url.includes('localhost')) {
		url = url + '?t=' + Date.now()
	}

	// fetch the file as is, then try adding .js and /index.js
	const promise = fetchWithFallbacks(url, ['', '.js', '/index.js'])
	if (promise) FETCH_CACHE.set(url, promise)

	return promise

	async function fetchWithFallbacks(url, suffixes) {
		for (const suffix of suffixes) {
			const full_url = url + suffix

			try {
				const response = await fetch(full_url)

				if (!response.ok || response.headers.get('content-type')?.includes('text/html')) {
					throw new Error(`Fetch failed for URL: ${full_url}` + (await response.text()))
				}

				return {
					url,
					body: await response.text()
				}
			} catch (error) {
				console.warn(`Failed to fetch from ${full_url}, trying next fallback.`)
			}
		}

		console.error('All fetch attempts failed for' + url) // If all fallbacks fail
	}
}

/**
 *
 * @param {Record<string, unknown>} pkg
 * @param {string} subpath
 * @param {string} pkg_url_base
 */
async function resolve_from_pkg(pkg, subpath, pkg_url_base) {
	// match legacy Rollup logic — pkg.svelte takes priority over pkg.exports
	if (typeof pkg.svelte === 'string' && subpath === '.') {
		return pkg.svelte
	}

	if (pkg.jsdelivr && subpath === '.') {
		return pkg.jsdelivr
	}

	// modern
	if (pkg.exports) {
		try {
			const [resolved] =
				resolve.exports(pkg, subpath, {
					browser: true,
					conditions: ['svelte', 'production']
				}) ?? []

			return resolved
		} catch {
			//   throw `no matched export path was found in "${pkg_name}/package.json"`
			throw `no matched export path was found in "pkg_name/package.json"`
		}
	}

	// legacy
	if (subpath === '.') {
		let resolved_id = resolve.legacy(pkg, {
			fields: ['browser', 'module', 'main']
		})

		if (typeof resolved_id === 'object' && !Array.isArray(resolved_id)) {
			const subpath = resolved_id['.']
			if (subpath === false) return 'data:text/javascript,export {}'

			resolved_id =
				subpath ??
				resolve.legacy(pkg, {
					fields: ['module', 'main']
				})
		}

		if (!resolved_id) {
			// last ditch — try to match index.js/index.mjs
			for (const index_file of ['/index.mjs', '/index.js', '.js']) {
				try {
					const indexUrl = new URL(index_file, `${pkg_url_base}`).href
					return (await follow_redirects(indexUrl)) ?? ''
				} catch {
					// maybe the next option will be successful
				}
			}

			//   throw `could not find entry point in "${pkg_name}/package.json"`
			throw `could not find entry point in "pkg_name/package.json"`
		}

		return resolved_id
	}

	if (typeof pkg.browser === 'object') {
		// this will either return `pkg.browser[subpath]` or `subpath`
		return resolve.legacy(pkg, {
			browser: subpath
		})
	}

	return subpath
}
