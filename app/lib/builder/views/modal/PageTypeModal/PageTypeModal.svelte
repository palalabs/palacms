<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog'
	import { goto } from '$app/navigation'
	import Item from './Item.svelte'
	import Button from '$lib/builder/ui/Button.svelte'
	import PageForm from './PageTypeForm.svelte'
	import { page } from '$app/state'
	import { Sites } from '$lib/pocketbase/collections'
	import type { PageType } from '$lib/common/models/PageType'
	import type { Resolved } from '$lib/common/json'
	import { ID } from '$lib/common/constants'

	const site_id = $derived(page.params.site)
	const site = $derived(Sites.one(site_id))

	async function create_page_type(new_page_type: Resolved<typeof PageType>) {
		if (!$site) return

		$site.data.page_types.push(new_page_type)
		const [created_page_type] = $site.data.page_types.slice(-1)
		goto(`/${$site.id}/page-type--${created_page_type[ID]}`)
	}

	let creating_page_type = $state(false)
</script>

<Dialog.Header title="Page Types" />
<main class="grid gap-2 p-2 bg-[var(--primo-color-black)]">
	{#if $site?.data.page_types.length}
		<ul class="grid gap-2">
			{#each $site.data.page_types as page_type}
				<li>
					<Item {page_type} active={false} />
				</li>
			{/each}
			{#if creating_page_type}
				<li style="background: #1a1a1a;">
					<PageForm
						on:create={({ detail: new_page_type }) => {
							creating_page_type = false
							create_page_type(new_page_type)
						}}
					/>
				</li>
			{/if}
		</ul>
	{/if}
	<Button variants="secondary fullwidth" disabled={creating_page_type === true} onclick={() => (creating_page_type = true)} label="Create Page Type" icon="akar-icons:plus" />
</main>
