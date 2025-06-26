<script>
	import Primo from '$lib/builder/Primo.svelte'
	import { self } from '$lib/pocketbase/PocketBase'
	import { onMount, untrack } from 'svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import { Sites, Pages, PageTypes, PageSections, PageTypeSections, PageTypeSymbols, SiteFields, SiteEntries, SiteSymbolFields, SiteSymbolEntries } from '$lib/pocketbase/collections'

	onMount(async () => {
		if (!self.authStore.isValid) {
			await goto('/auth')
		}
	})

	let { children } = $props()

	const site_id = $derived(page.params.site)
	const page_slug = $derived(page.params.page || '')
	const page_type_id = $derived(page.params.page_type)

	// Data will be loaded automatically by CollectionMapping system when accessed

	// Test: Enable site and pages derived
	const site = $derived(Sites.one(site_id))
	// Since we're loading with filter, all pages should be for this site
	const all_pages = $derived(Pages.list({ filter: `site = "${site_id}"` }))
	const currentPage = $derived(all_pages.find((p) => p.slug === page_slug))
</script>

{#if site && (all_pages.length > 0 || currentPage)}
	<Primo {site} {currentPage}>
		{@render children?.()}
	</Primo>
{:else}
	<div style="display: flex; justify-content: center; align-items: center; height: 100vh; color: white;">Loading...</div>
{/if}
