<script lang="ts">
	import { page } from '$app/state'
	import { ID } from '$lib/common/constants'
	import type { PageField } from '$lib/common/models/fields/PageField'
	import type { Id } from '$lib/common/models/Id'
	import { require_site } from '$lib/loaders/index.js'
	import type { Resolved } from '$lib/pocketbase/CollectionStore.js'
	import { get_direct_entries } from '../stores/helpers.js'
	import UI from '../ui/index.js'

	const { entity_id, field }: { entity_id: Id; field: Resolved<typeof PageField> } = $props()
	const site_id = page.params.site
	const site = $derived(require_site(site_id))
	const entry = $derived(get_direct_entries(entity_id, field)[0])
	const selectable_pages = $derived(Object.values($site?.data.entities.pages ?? {}).filter((p) => p?.page_type[ID] === field.page_type[ID]))
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
