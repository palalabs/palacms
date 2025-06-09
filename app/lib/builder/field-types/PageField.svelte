<script lang="ts">
	import { page } from '$app/state'
	import type { PageField } from '$lib/common/models/fields/PageField'
	import UI from '../ui/index.js'
	import { Sites } from '$lib/pocketbase/collections'
	import { getDirectEntries, type Entity } from '$lib/pocketbase/content.js'

	const { entity, field }: { entity: Entity; field: PageField } = $props()
	const site_id = page.params.site
	const site = $derived(Sites.one(site_id))
	const entry = $derived(getDirectEntries(entity, field)[0])
	const selectable_pages = $derived((site?.pages() ?? []).filter((p) => p.page_type === field.config.page_type))
</script>

<div>
	<UI.Select
		label={field.label}
		value={entry.value}
		options={selectable_pages.map((page) => ({
			value: page,
			label: page?.name
		}))}
		fullwidth={true}
	/>
</div>

<style lang="postcss">
	div {
		width: 100%;
	}
</style>
