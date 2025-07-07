import { find as _find, chain as _chain, flattenDeep as _flattenDeep } from 'lodash-es'
import { processors } from './component.js'
import { getContent } from '../pocketbase/content.js'
import { design_tokens } from './constants.js'
import { type locales } from '$lib/common/constants.js'
import type { Site } from '$lib/common/models/Site.js'
import type { Page } from '$lib/common/models/Page.js'
import type { SiteField } from '$lib/common/models/SiteField.js'
import type { PageTypeField } from '$lib/common/models/PageTypeField.js'
import type { SiteSymbolField } from '$lib/common/models/SiteSymbolField.js'
import { PageSection } from '$lib/common/models/PageSection.js'
import type { PageTypeSection } from '$lib/common/models/PageTypeSection.js'
import type { SiteEntry } from '$lib/common/models/SiteEntry.js'
import type { PageTypeEntry } from '$lib/common/models/PageTypeEntry.js'
import type { PageType } from '$lib/common/models/PageType.js'
import type { PageSectionEntry } from '$lib/common/models/PageSectionEntry.js'
import type { PageTypeSectionEntry } from '$lib/common/models/PageTypeSectionEntry.js'
import type { PageTypeSymbol } from '$lib/common/models/PageTypeSymbol.js'
import type { SiteSymbol } from '$lib/common/models/SiteSymbol.js'
import type { SiteSymbolEntry } from '$lib/common/models/SiteSymbolEntry.js'
import { page } from '$app/state'

export async function block_html({ code, data }) {
	const { html, css: postcss, js } = code
	// @ts-ignore
	const { css, error } = await processors.css(postcss || '')
	const res = await processors.html({
		component: { html, css, js, data }
	})
	return res
}

export async function page_html({
	site,
	page,
	page_type,
	page_sections,
	page_type_sections,
	page_type_symbols,
	symbols,
	site_fields,
	page_type_fields,
	symbol_fields,
	site_entries,
	page_type_entries,
	page_section_entries,
	page_type_section_entries,
	locale = 'en',
	no_js = false
}: {
	site: Site
	page: Page
	page_type: PageType
	page_sections: PageSection[]
	page_type_sections: PageTypeSection[]
	page_type_symbols: PageTypeSymbol[]
	symbols: SiteSymbol[]
	site_fields: SiteField[]
	page_type_fields: PageTypeField[]
	symbol_fields: SiteSymbolField[]
	site_entries: SiteEntry[]
	page_type_entries: PageTypeEntry[]
	symbol_entries: SiteSymbolEntry[]
	page_section_entries: PageSectionEntry[]
	page_type_section_entries: PageTypeSectionEntry[]
	locale?: (typeof locales)[number]
	no_js?: boolean
}) {
	const site_data = {
		...getContent(site, site_fields, site_entries),
		...getContent(page_type, page_type_fields, page_type_entries)
	}
	const head = {
		code: site.head + page_type.head,
		data: site_data
	}

	page_sections = page_sections.filter((section) => section.page === page.id)
	page_type_sections = page_type_sections.filter((section) => section.page_type === page_type.id)
	page_type_symbols = page_type_symbols.filter((symbol) => symbol.page_type === page_type.id)

	const header_sections = page_type_sections.filter((section) => section.zone === 'header')
	const footer_sections = page_type_sections.filter((section) => section.zone === 'footer')
	const page_type_body_sections = page_type_sections.filter((section) => section.zone === 'body')
	const body_sections = page_type_symbols.length === 0 || page_sections.length === 0 ? page_type_body_sections : page_sections

	const sections = [...header_sections, ...body_sections, ...footer_sections].filter(deduplicate('id'))
	const section_entries = [...page_type_section_entries, ...page_section_entries].filter((entry) => sections.some((section) => section.id === entry.section)).filter(deduplicate('id'))

	const component = (
		await Promise.all(
			sections.map(async (section: PageTypeSection | PageSection) => {
				const symbol = symbols.find((symbol) => symbol.id === section.symbol)
				if (!symbol) return []

				const { html, css: postcss, js } = symbol

				const data = getContent(section, symbol_fields, section_entries)[locale] ?? {}

				// @ts-ignore
				const { css, error } = await processors.css(postcss || '')
				return [
					{
						html: `
							<div data-section="${section.id}" id="section-${section.id}" data-symbol="${symbol.id}">
								${html}
							</div>`,
						js,
						css,
						data
					}
				]
			})
		)
	).flat()

	const res = await processors.html({
		component,
		head,
		locale
	})

	const symbol_ids = sections.map((section) => section.symbol).filter((value, index, array) => array.indexOf(value) === index)

	const final = `\
 <!DOCTYPE html>
 <html lang="${locale}">
   <head>
     <meta name="generator" content="PalaCMS" />
     ${res.head}
     <style>${res.css}</style>
   </head>
   <body id="page">
     ${res.html}
     ${no_js ? `` : `<script type="module">${fetch_modules(symbol_ids)}</script>`}
     ${site.foot}
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
       ${sections
					.filter((section) => section.symbol === id)
					.map((section) => {
						const instance_content = getContent(section, symbol_fields, section_entries)[locale]
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

const deduplicate =
	<T>(key: keyof T) =>
	(item: T, index: number, array: T[]) =>
		array.findIndex((value) => value[key] === item[key]) === index
