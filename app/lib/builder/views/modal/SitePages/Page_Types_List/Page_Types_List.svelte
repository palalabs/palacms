<script lang="ts">
	import { goto } from '$app/navigation'
	import Item from './Item.svelte'
	import Button from '$lib/builder/ui/Button.svelte'
	import PageForm from './PageTypeForm.svelte'
	import modal from '$lib/builder/stores/app/modal'
	import { page } from '$app/state'
	import { require_site } from '$lib/loaders'
	import type { PageType } from '$lib/common/models/PageType'
	import type { Resolved } from '$lib/common/json'
	import { ID } from '$lib/common/constants'

	const site_id = $derived(page.params.site)
	const site = $derived(require_site(site_id))

	async function create_page_type(new_page_type: Resolved<typeof PageType>) {
		if (!$site) return

		$site.data.page_types.push(new_page_type)
		const [created_page_type] = $site.data.page_types.slice(-1)
		goto(`/${$site.id}/page-type--${created_page_type[ID]}`)
		modal.hide()
	}

	let creating_page = $state(false)
</script>

{#if $site?.data.page_types.length}
	<ul class="page-list root">
		{#each $site.data.page_types as page_type}
			<li>
				<Item {page_type} active={false} />
			</li>
		{/each}
		{#if creating_page}
			<li style="background: #1a1a1a;">
				<PageForm
					on:create={({ detail: new_page_type }) => {
						creating_page = false
						create_page_type(new_page_type)
					}}
				/>
			</li>
		{/if}
	</ul>
{/if}
<Button variants="secondary fullwidth" disabled={creating_page === true} onclick={() => (creating_page = true)} label="New Page Type" icon="akar-icons:plus" />

<style lang="postcss">
	ul.page-list {
		display: grid;
		gap: 0.5rem;
		color: var(--primo-color-white);
		border-radius: var(--primo-border-radius);
		margin-bottom: 1rem;

		li {
			border-radius: 0.25rem;
		}
	}
</style>
