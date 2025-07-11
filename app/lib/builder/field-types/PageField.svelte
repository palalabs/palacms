<script lang="ts">
	import { page } from '$app/state'
	import type { PageField } from '$lib/common/models/fields/PageField'
	import UI from '../ui/index.js'
	import { Sites } from '$lib/pocketbase/collections'
	import type { Entity } from '$lib/pocketbase/content.js'
	import type { Entry } from '$lib/common/models/Entry'

	const { entity, field, entry, onchange }: { entity: Entity; field: PageField; entry?: Entry; onchange?: (value: any) => void } = $props()
	const host = $derived(page.url.host)
	const site = $derived(Sites.list({ filter: `host = "${host}"` })?.[0])
	const selectable_pages = $derived.by(() => {
		const pages = site?.pages() ?? []
		const filtered = pages.filter((p) => p.page_type === field.config.page_type)
		return filtered
	})
</script>

<div>
	<UI.Select
		label={field.label}
		value={entry?.value || ''}
		options={selectable_pages.map((page) => ({
			value: page.id,
			label: page?.name
		}))}
		on:input={({ detail }) => {
			if (onchange) {
				onchange(detail)
			}
		}}
		fullwidth={true}
	/>
</div>

<style lang="postcss">
	div {
		width: 100%;
	}
</style>
