<script lang="ts">
	import { find as _find } from 'lodash-es'
	import IFrame from '$lib/builder/components/IFrame.svelte'
	import { LibrarySymbols } from '$lib/pocketbase/collections'
	import { block_html } from '$lib/builder/code_generators'
	import { static_iframe_srcdoc } from '$lib/builder/components/misc'

	/**
	 * @typedef {Object} Props
	 * @property {string} symbol_id
	 * @property {string | null} [preview]
	 * @property {string} [head]
	 * @property {onclick} function
	 * @property {children} Snippet
	 */

	/** @type {Props} */
	let { symbol_id, preview = null, head = '', onclick, children } = $props()

	const symbol = $derived(LibrarySymbols.one(symbol_id))

	let generated_preview = $state(preview)

	$effect(() => {
		if (!preview && symbol) {
			get_preview()
		}
	})

	async function get_preview() {
		if (!symbol) return
		
		try {
			// Use the proper code generator like other preview components
			const code = { html: symbol.html, css: symbol.css, js: symbol.js }
			
			// Get actual field data for preview
			const fields = symbol.fields()
			const entries = symbol.entries()
			let data = {}
			
			if (fields && entries) {
				// Build data object from fields and entries
				for (const field of fields) {
					const entry = entries.find(e => e.field === field.id && e.locale === 'en')
					if (entry) {
						data[field.key] = entry.value
					} else {
						// Provide default values for fields without entries
						data[field.key] = field.type === 'text' ? `Sample ${field.label}` : ''
					}
				}
			}
			
			const generated_code = await block_html({ code, data })
			// static_iframe_srcdoc expects an object with head, html, css properties
			generated_preview = static_iframe_srcdoc({
				head: head,
				html: generated_code.html,
				css: generated_code.css,
				foot: ''
			})
		} catch (error) {
			console.error('Failed to generate symbol preview:', error)
			// Fallback using static_iframe_srcdoc with symbol data
			generated_preview = static_iframe_srcdoc({
				head: head,
				html: symbol.html,
				css: symbol.css,
				foot: ''
			})
		}
	}
</script>

<div class="relative w-full bg-gray-900 rounded-bl rounded-br">
	<button {onclick} class="w-full rounded-tl rounded-tr overflow-hidden">
		<IFrame srcdoc={generated_preview} {head} />
	</button>
	<div class="w-full p-3 pt-2 bg-gray-900 truncate flex items-center justify-between">
		<div class="text-sm font-medium leading-none truncate" style="width: calc(100% - 2rem)">{symbol?.name}</div>
		<div>
			{@render children()}
		</div>
	</div>
</div>
