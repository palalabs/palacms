<script lang="ts">
	import * as _ from 'lodash-es'
	import { PaneGroup, Pane, PaneResizer } from 'paneforge'
	import FullCodeEditor from '$lib/builder/views/modal/SectionEditor/FullCodeEditor.svelte'
	import ComponentPreview, { has_error } from '$lib/builder/components/ComponentPreview.svelte'
	import Fields from '$lib/builder/components/Fields/FieldsContent.svelte'
	import LargeSwitch from '$lib/builder/ui/LargeSwitch.svelte'
	import * as Dialog from '$lib/components/ui/dialog'
	import { static_iframe_srcdoc } from '$lib/builder/components/misc'
	import { block_html } from '$lib/builder/code_generators.js'
	import type { Symbol } from '$lib/common/models/Symbol'

	let {
		symbol = $bindable({ name: '', css: '', html: '', js: '' }),
		head = '',
		append = '',
		onsubmit
	}: {
		symbol?: Omit<Symbol, 'id'>
		head?: string
		append?: string
		onsubmit: (data: any) => void
	} = $props()

	// Get field data for component props
	let component_data = $derived.by(() => {
		if (!symbol?.fields || !symbol?.entries) return {}
		
		const fields = symbol.fields()
		const entries = symbol.entries()
		let data = {}
		
		if (fields && entries) {
			for (const field of fields) {
				const entry = entries.find(e => e.field === field.id && e.locale === 'en')
				data[field.key] = entry?.value || ''
			}
		}
		
		return data
	})
	// Create code object for ComponentPreview (matching SectionEditor pattern)
	let code = $derived({
		html: symbol?.html || '<!-- Add your HTML here -->',
		css: symbol?.css || '/* Add your CSS here */',
		js: symbol?.js || ''
	})

	let tab = $state('code')
	function toggle_tab() {
		tab = tab === 'code' ? 'content' : 'code'
	}

	// detect hotkeys from within inputs
	function handle_hotkey(e) {
		const { metaKey, key } = e
		if (metaKey && key === 's') {
			e.preventDefault()
			onsave()
		}
		if (metaKey && key === 'e') {
			e.preventDefault()
			toggle_tab()
		}
	}

	let loading = $state(false)
	async function onsave() {
		loading = true
		try {
			if (!symbol) {
				console.error('Symbol is null or undefined')
				return
			}

			const { css = '', html = '', js = '', name = '' } = symbol

			// Create preview using the raw symbol data
			const preview = static_iframe_srcdoc({
				head: head || '',
				html: html,
				css: css,
				foot: ''
			})

			// Call the onsubmit function with the symbol data and preview
			onsubmit({ name: name || 'Untitled Block', css, html, js, preview })
		} catch (error) {
			console.error('Error in onsave:', error)
		} finally {
			loading = false
		}
	}
</script>

<Dialog.Header
	class="mb-2"
	title="Block"
	button={{
		label: 'Done',
		onclick: onsave,
		loading,
		disabled: false
	}}
>
	<LargeSwitch bind:active_tab_id={tab} />
</Dialog.Header>

<div class="max-h-[91vh] flex-1">
	<PaneGroup direction="horizontal">
		<Pane defaultSize={50}>
			{#if tab === 'code'}
				<FullCodeEditor bind:html={symbol.html} bind:css={symbol.css} bind:js={symbol.js} data={component_data} on:save={onsave} on:mod-e={toggle_tab} />
			{:else if tab === 'content'}
				<Fields entity={symbol} fields={symbol?.fields?.() || []} entries={symbol?.entries?.() || []} onkeydown={handle_hotkey} />
			{/if}
		</Pane>
		<PaneResizer class="PaneResizer" />
		<Pane defaultSize={50}>
			<div class="preview-wrapper">
				<ComponentPreview {code} data={component_data} view="small" {loading} {head} />
			</div>
		</Pane>
	</PaneGroup>
</div>
