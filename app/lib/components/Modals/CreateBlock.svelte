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

	let { symbol = { name: '', css: '', html: '', js: '' }, head = '', append = '' }: { symbol: Omit<Symbol, 'id'>; head?: string; append?: string } = $props()

	let component_data = $derived({}) // TODO: Implement

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
		const { css, html, js } = symbol
		const code = { css, html, js }
		const generate_code = await block_html({ code, data: component_data })
		const preview = static_iframe_srcdoc(generate_code)
	}
</script>

<Dialog.Header
	class="mb-2"
	title="Block"
	button={{
		label: 'Done',
		onclick: onsave,
		loading,
		disabled: $has_error
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
				<Fields entity={symbol} fields={[]} onkeydown={handle_hotkey} />
			{/if}
		</Pane>
		<PaneResizer class="PaneResizer" />
		<Pane defaultSize={50}>
			<ComponentPreview view="small" {loading} {head} {append} data={component_data} />
		</Pane>
	</PaneGroup>
</div>
