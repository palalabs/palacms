<script>
	import { createEventDispatcher } from 'svelte'
	import * as _ from 'lodash-es'
	// import ThemeThumbnail from '$lib/components/ThemeThumbnail.svelte'
	import StarterButton from '$lib/components/StarterButton.svelte'
	import { page } from '$app/state'
	import { require_site_list } from '$lib/loaders'

	/**
	 * @typedef {Object} Props
	 * @property {string} [append]
	 */

	/** @type {Props} */
	const { append = '' } = $props()

	const themes = require_site_list(null)

	async function download_file(site_id, file) {
		// TODO: Implement
	}

	const dispatch = createEventDispatcher()

	let selected = $state(null)
	async function select_theme(id, preview) {
		selected = id
		dispatch('select', { id, preview })
	}
</script>

<div class="themes">
	{#each $themes as { id, name }}
		<StarterButton site={{ id, name }} selected={selected === id} onclick={() => select_theme(id, undefined)} preview={undefined} {append} />
	{/each}
</div>

<style lang="postcss">
	.themes {
		display: grid;
		grid-template-columns: 1fr 1fr;
		place-items: start;
		gap: 1rem;
	}
</style>
