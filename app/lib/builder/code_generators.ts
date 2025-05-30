import { find as _find, chain as _chain, flattenDeep as _flattenDeep } from 'lodash-es'
import * as _ from 'lodash-es'
import { processors } from './component.js'
import { get_content } from './stores/helpers'
import { design_tokens } from './constants.js'
import type { Page } from '$lib/common/models/Page.js'
import { type locales } from '$lib/common/constants.js'
import type { Site } from '$lib/common/models/Site.js'

export async function block_html({ code, data }) {
	const { html, css: postcss, js } = code
	// @ts-ignore
	const { css, error } = await processors.css(postcss || '')
	const res = await processors.html({
		component: { html, css, js, data }
	})
	return res
}

export async function page_html({ site, page, locale = 'en', no_js = false }: { site: Site; page: Page; locale?: (typeof locales)[number]; no_js?: boolean }) {
	const site_data = {} // TODO
	const head = {
		code: site.head, // + page.page_type.head,
		data: site_data
	}
	const component = await Promise.all([
		// page.sections
		...[].map(async (section) => {
			const { html, css: postcss, js } = section.symbol.code

			const data = {} // TODO

			// @ts-ignore
			const { css, error } = await processors.css(postcss || '')
			return {
				html: `
         <div data-section="${section.id}" id="section-${section.id}" data-symbol="${section.symbol.id}">
           ${html}
         </div>`,
				js,
				css,
				data
			}
		}),
		(async () => {
			return {
				html: site.foot,
				css: ``,
				js: ``,
				data: site_data
			}
		})()
	])

	const res = await processors.html({
		component,
		head,
		locale
	})

	/// page.sections
	const symbol_ids = [].map((section) => section.symbol.id).filter((value, index, array) => array.indexOf(value) === index)

	const final = `\
 <!DOCTYPE html>
 <html lang="${locale}">
   <head>
     <meta name="generator" content="WeaveCMS" />
     ${res.head}
     <style>${res.css}</style>
   </head>
   <body id="page">
     ${res.html}
     ${no_js ? `` : `<script type="module">${fetch_modules(symbol_ids)}</script>`}
   </body>
 </html>
 `

	return {
		success: !!res.html,
		html: final,
		js: res.js
	}

	// fetch module to hydrate component, include hydration data
	function fetch_modules(symbol_ids: string[]) {
		return symbol_ids
			.map(
				(id) => `
     import('/_symbols/${id}.js')
     .then(({default:App}) => {
       ${page.sections
					.filter((section) => section.symbol.id === id)
					.map((section) => {
						const instance_content = get_content(section.id, section.symbol.fields)[locale]
						return `
           new App({
             target: document.querySelector('#section-${section.id}'),
             hydrate: true,
             props: ${JSON.stringify(instance_content)}
           })
         `
					})
					.join('\n')}
     })
     .catch(e => console.error(e));
   `
			)
			.join('\n')
	}
}

export function site_design_css(values) {
	return `
		<link rel="preconnect" href="https://fonts.bunny.net">
		<link href="https://fonts.bunny.net/css2?family=${values['heading_font'].replace(/ /g, '+')}:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&family=${values['body_font'].replace(
			/ /g,
			'+'
		)}:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700" rel="stylesheet">
	<style>
	:root {\n${Object.entries(design_tokens)
		.map(([token, { variable }]) => `--theme-${variable}: ${values[token]};`)
		.join('\n')}}
	</style>
	`
}
