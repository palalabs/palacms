<script lang="ts">
	import { tick, onDestroy } from 'svelte'
	import { browser } from '$app/environment'
	import { find as _find } from 'lodash-es'
	import { page_html } from '$lib/builder/code_generators'
	import { PageTypes, Sites, SiteSymbols } from '$lib/pocketbase/collections'

	let { site_id, preview = $bindable(), head = '', append = '', style = '' }: { site_id?: string; preview?: string; head?: string; append?: string; style?: string } = $props()

	const site = $derived(site_id ? Sites.one(site_id) : undefined)
	const page = $derived(site?.homepage())
	const page_type = $derived(page && PageTypes.one(page.page_type))
	const page_sections = $derived(page?.sections())
	const page_type_sections = $derived(page_type?.sections())
	const page_type_symbols = $derived(page_type?.symbols())
	const symbols = $derived(page_sections && page_type_sections && [...page_sections, ...page_type_sections].map((section) => SiteSymbols.one(section.symbol)).filter((symbol) => symbol !== undefined))
	const site_fields = $derived(site?.fields())
	const page_type_fields = $derived(page_type?.fields())
	const symbol_fields = $derived(symbols?.every((symbol) => symbol.fields() !== undefined) ? symbols.flatMap((symbol) => symbol.fields() ?? []) : undefined)
	const site_entries = $derived(site?.entries())
	const page_type_entries = $derived(page_type?.entries())
	const symbol_entries = $derived(symbols?.every((symbol) => symbol.entries() !== undefined) ? symbols.flatMap((symbol) => symbol.entries() ?? []) : undefined)
	const page_section_entries = $derived(page_sections?.every((section) => section.entries() !== undefined) ? page_sections.flatMap((section) => section.entries() ?? []) : undefined)
	const page_type_section_entries = $derived(page_type_sections?.every((section) => section.entries() !== undefined) ? page_type_sections.flatMap((section) => section.entries() ?? []) : undefined)
	$effect(() => {
		if (
			!preview &&
			site &&
			page &&
			page_type &&
			page_sections &&
			page_type_sections &&
			page_type_symbols &&
			symbols &&
			site_fields &&
			page_type_fields &&
			symbol_fields &&
			site_entries &&
			page_type_entries &&
			symbol_entries &&
			page_section_entries &&
			page_type_section_entries
		) {
			page_html({
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
				symbol_entries,
				page_section_entries,
				page_type_section_entries,
				no_js: true
			}).then(({ html }) => {
				preview = html
			})
		}
	})

	let container = $state()
	let scale = $state()
	let iframeHeight = $state()
	let iframe = $state()
	let iframeLoaded = $state()
	let resize_observer = $state()

	async function init_preview() {
		await tick()
		if (!iframe?.contentWindow?.document?.body) return
		if (resize_observer) resize_observer?.disconnect()

		resize_observer = new ResizeObserver((entries) => {
			const { offsetWidth: parentWidth } = container
			const { offsetWidth: childWidth } = iframe

			if (parentWidth === 0) return
			scale = parentWidth / childWidth
			iframeHeight = `${100 / scale}%`
		})

		resize_observer.observe(container)
	}

	function resize_preview() {
		if (!container || !iframe) return
		const { clientWidth: parentWidth } = container
		const { clientWidth: childWidth } = iframe
		scale = parentWidth / childWidth
		iframeHeight = `${100 / scale}%`
	}

	function append_to_head(code) {
		var container = document.createElement('div')
		container.innerHTML = code
		Array.from(container.childNodes).forEach((node) => {
			iframe.contentWindow.document.head.appendChild(node)
		})
	}

	$effect(() => {
		iframe && head && append_to_head(head)
	})

	function append_to_iframe(code) {
		var container = document.createElement('div')

		// Set the innerHTML of the container to your HTML string
		container.innerHTML = code

		// Append each element in the container to the document head
		Array.from(container.childNodes).forEach((node) => {
			iframe.contentWindow.document.body.appendChild(node)
		})
	}

	$effect(() => {
		iframe && append && append_to_iframe(append)
	})

	onDestroy(() => {
		resize_observer?.disconnect()
	})
</script>

<svelte:window onresize={resize_preview} />

<div class="iframe-root bg-gray-900" {style}>
	<div bind:this={container} class="iframe-container z-10">
		{#if browser && preview}
			<iframe
				tabindex="-1"
				bind:this={iframe}
				class="rounded overflow-hidden bg-white"
				sandbox="allow-same-origin"
				style="transform: scale({scale}); width: 1024px;"
				style:height={iframeHeight}
				class:fadein={iframeLoaded}
				title="page preview"
				srcdoc={preview + append}
				onload={async () => {
					await init_preview()
					iframeLoaded = !!preview
					append_to_head(head)
				}}
			></iframe>
		{/if}
	</div>
</div>

<style lang="postcss">
	.iframe-root {
		overflow: hidden;
		position: relative;
		padding-top: var(--thumbnail-height, 130%);
	}
	.iframe-container {
		position: absolute;
		inset: 0;
		z-index: 10;
		opacity: 1;
		transition: opacity 0.1s;
		width: 100%;
		height: 100%;
		font-size: 0.75rem;
		line-height: 1rem;
		overflow: hidden;
		overflow-wrap: break-word;
		user-select: none;
	}
	iframe {
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.1s;
		width: 100vw;
		will-change: opacity;
		transform-origin: top left;
		/* height: 1000vh; */
	}
	.fadein {
		opacity: 1;
	}
</style>
