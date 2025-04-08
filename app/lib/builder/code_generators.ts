import { find as _find, chain as _chain, flattenDeep as _flattenDeep } from 'lodash-es'
import * as _ from 'lodash-es'
import { processors } from './component.js'
import { get_content } from './stores/helpers'
import { design_tokens } from './constants.js'
import type { Resolved } from '$lib/pocketbase/Resolved'
import type { Page } from '$lib/common/models/Page.js'
import { ID, SITE, type locales } from '$lib/common/constants.js'
import type { Site } from '$lib/common/models/Site.js'
import type { Id } from '$lib/common/models/Id.js'

export async function block_html({ code, data }) {
	const { html, css: postcss, js } = code
	// @ts-ignore
	const { css, error } = await processors.css(postcss || '')
	const res = await processors.html({
		component: { html, css, js, data }
	})
	return res
}

export async function page_html({ site, page, locale = 'en', no_js = false }: { site: Resolved<typeof Site>; page: Resolved<typeof Page>; locale?: (typeof locales)[number]; no_js?: boolean }) {
	const head = {
		code: site_design_css(site.data.design) + site.data.code.head + page.page_type.code.head
	}
	const component = await Promise.all([
		...page.sections.map(async (section) => {
			const { html, css: postcss, js } = section.symbol.code

			const data = get_content(section[ID], section.symbol.fields)[locale]

			// @ts-ignore
			const { css, error } = await processors.css(postcss || '')
			return {
				html: `
         <div data-section="${section[ID]}" id="section-${section[ID]}" data-symbol="${section.symbol[ID]}">
           ${html}
         </div>`,
				js,
				css,
				data
			}
		}),
		(async () => {
			return {
				html: site.data.code.foot,
				css: ``,
				js: ``,
				data: get_content(SITE, site.data.fields)
			}
		})()
	])

	const res = await processors.html({
		component,
		head,
		locale
	})

	const symbol_ids = page.sections.map((section) => section.symbol[ID]).filter((value, index, array) => array.indexOf(value) === index)

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
	function fetch_modules(symbol_ids: Id[]) {
		return symbol_ids
			.map(
				(id) => `
     import('/_symbols/${id}.js')
     .then(({default:App}) => {
       ${page.sections
					.filter((section) => section.symbol[ID] === id)
					.map((section) => {
						const instance_content = get_content(section[ID], section.symbol.fields)[locale]
						return `
           new App({
             target: document.querySelector('#section-${section[ID]}'),
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
