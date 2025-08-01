<script lang="ts">
	import { getIcon, loadIcon, buildIcon } from '@iconify/svelte'
	import IconPicker from '../components/IconPicker.svelte'
	import axios from 'axios'
	import type { Entity } from '$lib/pocketbase/content'
	import type { Field } from '$lib/common/models/Field'
	import type { Entry } from '$lib/common/models/Entry'

	let { field, entry, onchange, search_query = '' }: { entity: Omit<Entity, 'id'>; field: Omit<Field, 'id'>; entry?: Omit<Entry, 'id'>; onchange: (value: string) => void; search_query?: string } = $props()
	
	const value = $derived(entry?.value ?? '')

	let searched = $state(false)

	$effect(() => {
		if (!getIcon(value) && !value.startsWith('<svg')) {
			// reset value when invalid (i.e. when switching field type)
			onchange('')
		} else if (getIcon(value)) {
			// convert icon-id to icon-svg
			select_icon(value)
		}
	})

	// search immediately when passed a query
	if (search_query) {
		search()
	}

	// hide icons when clearing search text
	$effect(() => {
		if (search_query === '') {
			searched = false
		}
	})

	let icons = []
	async function search() {
		axios.get(`https://api.iconify.design/search?query=${encodeURIComponent(search_query.trim())}&limit=32`).then(({ data }) => {
			icons = data.icons
			searched = true
		})
	}

	async function select_icon(icon) {
		// delete icon
		if (!icon) {
			onchange('')
			return
		}

		// select icon
		const icon_data = await loadIcon(icon)
		if (icon_data) {
			const { attributes } = buildIcon(icon_data)
			const svg = `<svg xmlns="http://www.w3.org/2000/svg" data-key="${field.key}" data-icon="${icon}" aria-hidden="true" role="img" height="${attributes.height}" width="${attributes.width}" viewBox="${attributes.viewBox}" preserveAspectRatio="${attributes.preserveAspectRatio}">${icon_data.body}</svg>`
			onchange(svg)
		}
	}
</script>

<div class="IconPicker">
	{#if field.label}
		<p class="primo--field-label">{field.label}</p>
	{/if}
	<IconPicker svg_preview={value} {search_query} on:input={({ detail: icon }) => select_icon(icon)} />
</div>

<style lang="postcss">
</style>
