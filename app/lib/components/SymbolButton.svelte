<script lang="ts">
	import { find as _find } from 'lodash-es'
	import IFrame from '$lib/builder/components/IFrame.svelte'
	import { require_library } from '$lib/loaders'

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

	const library = require_library()
	const symbol = $derived($library?.data.entities.symbols[symbol_id])

	if (!preview) {
		get_preview()
	}
	async function get_preview() {
		// TODO: Implement
	}
</script>

<div class="relative w-full bg-gray-900 rounded-bl rounded-br">
	<button {onclick} class="w-full rounded-tl rounded-tr overflow-hidden">
		<IFrame srcdoc={preview} {head} />
	</button>
	<div class="w-full p-3 pt-2 bg-gray-900 truncate flex items-center justify-between">
		<div class="text-sm font-medium leading-none truncate" style="width: calc(100% - 2rem)">{symbol?.name}</div>
		<div>
			{@render children()}
		</div>
	</div>
</div>
