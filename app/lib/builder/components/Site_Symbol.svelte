<script lang="ts">
	import { fade } from 'svelte/transition'
	import * as _ from 'lodash-es'
	import Icon from '@iconify/svelte'
	import { processCode } from '../utils'
	import IFrame from '../components/IFrame.svelte'
	import type { SiteSymbol } from '$lib/common/models/SiteSymbol'
	import { page } from '$app/state'
	import { Sites } from '$lib/pocketbase/collections'
	import type { LibrarySymbol } from '$lib/common/models/LibrarySymbol'
	import type { Symbol } from '$lib/common/models/Symbol'

	let { symbol = $bindable(), checked = false, onclick }: { symbol: SiteSymbol | LibrarySymbol; checked?: boolean; onclick?: () => void } = $props()

	const host = $derived(page.url.host)
	const site = $derived(Sites.list({ filter: `host = "${host}"` })?.[0])

	let name_el

	let renaming = false
	async function toggle_name_input() {
		renaming = !renaming
		// workaround for inability to see cursor when div empty
		if (symbol.name === '') {
			symbol.name = 'Block'
		}
	}

	let height = $state(0)

	let componentCode = $state()
	let component_error = $state()
	async function compile_component_code(symbol: Symbol) {
		if (!site) return
		const data = {} // TODO
		let res = await processCode({
			component: {
				head: site.head,
				css: symbol.css,
				html: symbol.html,
				data: data
			},
			buildStatic: true,
			hydrated: true
		})
		if (res.error) {
			component_error = res.error
		} else {
			component_error = null
			res.html = res.html + res.head
			componentCode = res
		}
	}

	// move cursor to end of name
	$effect(() => {
		if (name_el) {
			const range = document.createRange()
			const sel = window.getSelection()
			range.setStart(name_el, 1)
			range.collapse(true)

			sel?.removeAllRanges()
			sel?.addRange(range)
		}
	})
	$effect.pre(() => {
		compile_component_code(symbol)
	})
</script>

<button class="sidebar-symbol" {onclick}>
	<div class="symbol">
		{#if checked}
			<div class="check" in:fade={{ duration: 100 }}>
				<Icon icon="material-symbols:check" />
			</div>
		{/if}
		{#if component_error}
			<div class="error">
				<Icon icon="bxs:error" />
			</div>
		{:else}
			{#key componentCode}
				<IFrame bind:height {componentCode} />
			{/key}
		{/if}
	</div>
</button>

<style lang="postcss">
	.sidebar-symbol {
		width: 100%;
		--IconButton-opacity: 0;

		&:hover:not(.dragging) {
			--IconButton-opacity: 1;
		}

		.symbol {
			width: 100%;
			border-radius: 0.25rem;
			overflow: hidden;
			position: relative;
			min-height: 2rem;
			transition: box-shadow 0.2s;
			border: 1px solid var(--color-gray-8);
		}
	}
	.check {
		position: absolute;
		inset: 0;
		z-index: 9;
		background: rgba(0, 0, 0, 0.9);
		font-size: 3rem;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--weave-primary-color);
	}
	.error {
		display: flex;
		justify-content: center;
		height: 100%;
		position: absolute;
		inset: 0;
		align-items: center;
		background: #ff0000;
	}
</style>
