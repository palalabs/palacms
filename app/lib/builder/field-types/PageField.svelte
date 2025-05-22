<script lang="ts">
	import { page } from '$app/state'
	import type { PageField } from '$lib/common/models/fields/PageField'
	import { get_direct_entries } from '../stores/helpers.js'
	import UI from '../ui/index.js'
	import { Sites } from '$lib/pocketbase/collections'

	const { entity_id, field }: { entity_id: string; field: PageField } = $props()
	const site_id = page.params.site
	const site = $derived(Sites.one(site_id))
	const entry = $derived(get_direct_entries(entity_id, field)[0])
	const selectable_pages = $derived(Object.values($site?.data.entities.pages ?? {}).filter((p) => p?.page_type.id === field.page_type.id))
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
