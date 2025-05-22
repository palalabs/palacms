<script>
	import * as Sidebar from '$lib/components/ui/sidebar'
	import AppSidebar from '$lib/components/app-sidebar.svelte'
	import { Globe, LayoutTemplate, Store, Library, Cuboid } from 'lucide-svelte'
	import { page } from '$app/stores'
	import { pb } from '$lib/pocketbase/PocketBase'
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { SiteGroups } from '$lib/pocketbase/collections'
	import { require_library, require_marketplace_symbol_groups } from '$lib/loaders'

	onMount(async () => {
		if (!pb.authStore.isValid) {
			await goto('/auth')
		}
	})

	let { children } = $props()

	const site_groups = $derived(SiteGroups.list())
	const library = require_library()
	const marketplace_symbol_groups = require_marketplace_symbol_groups()

	const sidebar_menu = $derived.by(() => {
		const pathname = $page.url.pathname
		const path = pathname.split('/').slice(0, 3).join('/')
		return {
			'/dashboard/sites': {
				title: 'Sites',
				icon: Globe,
				site_groups: $site_groups
			},
			'/dashboard/library': {
				title: 'Block Library',
				icon: Library,
				symbol_groups: $library?.data.symbol_groups ?? []
			},
			'/dashboard/marketplace': {
				title: 'Marketplace',
				icon: Store,
				marketplace_symbol_groups: $marketplace_symbol_groups ?? [],
				buttons: [
					{
						icon: LayoutTemplate,
						label: 'Starters',
						url: '/dashboard/marketplace/starters',
						isActive: pathname === '/dashboard/marketplace/starters'
					},
					{
						icon: Cuboid,
						label: 'Blocks',
						url: '/dashboard/marketplace/blocks',
						isActive: pathname === '/dashboard/marketplace/blocks'
					}
				]
			}
		}[path]
	})
</script>

<Sidebar.Provider>
	<AppSidebar {sidebar_menu} />
	<Sidebar.Inset>
		{@render children?.()}
	</Sidebar.Inset>
</Sidebar.Provider>
