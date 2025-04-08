<script lang="ts">
	import Item from './Item.svelte'
	import Button from '$lib/builder/ui/Button.svelte'
	import { flip } from 'svelte/animate'
	import PageForm from './PageForm.svelte'
	import { require_site } from '$lib/loaders'
	import { page } from '$app/state'
	import { ID } from '$lib/common/constants'
	import { Page } from '$lib/common/models/Page'
	import type { Resolved } from '$lib/pocketbase/Resolved'

	const site_id = $derived(page.params.site)
	const site = $derived(require_site(site_id))

	async function create_page(new_page: Resolved<typeof Page>, parent: Resolved<typeof Page>) {
		if (!$site) return
		const url_taken = Object.values($site.data.entities.pages).some((page) => page?.slug === new_page.slug)
		if (url_taken) {
			alert(`That URL is already in use`)
		} else {
			parent.children.push(new_page)
		}
	}

	async function delete_page(page: Resolved<typeof Page>) {
		if (!$site) return
		delete $site.data.entities.pages[page[ID]]
	}

	let creating_page = $state(false)
</script>

<ul class="page-list root">
	{#each $site ? [$site.data.root] : [] as page (page[ID])}
		<li animate:flip={{ duration: 200 }}>
			<Item {page} active={false} on:create={({ detail }) => create_page(detail.page, page)} on:delete={({ detail: terminal_page }) => delete_page(terminal_page)} />
		</li>
	{/each}
	{#if creating_page}
		<li style="background: #1a1a1a;">
			<PageForm
				on:create={({ detail: new_page }) => {
					if (!$site) return
					creating_page = false
					create_page(new_page, $site.data.root)
				}}
			/>
		</li>
	{/if}
</ul>
<Button variants="secondary fullwidth" disabled={creating_page === true} onclick={() => (creating_page = true)} label="Create Page" icon="akar-icons:plus" />

<style lang="postcss">
	ul.page-list {
		display: grid;
		/* gap: 0.5rem; */
		color: var(--primo-color-white);

		margin-bottom: 0.5rem;

		li {
			/* overflow: hidden; */
		}

		/* &.root > li:not(:first-child) {
			border-top: 1px solid #222;
		} */
	}
</style>
