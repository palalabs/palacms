<script>
	import Primo from '$lib/builder/Primo.svelte'
	import { self, user } from '$lib/pocketbase/PocketBase'
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import { Sites, Pages, SiteGroups } from '$lib/pocketbase/collections'
	import CreateSite from '$lib/components/CreateSite.svelte'

	onMount(async () => {
		if (!self.authStore.isValid) {
			await goto('/admin/auth')
		}
	})

	let { children } = $props()

	const host = $derived(page.url.host)
	const sites = $derived(Sites.list({ filter: `host = "${host}"` }))
	const site = $derived(sites?.[0])
	const page_slug = $derived(page.params.page || '')
	const current_page = $derived(site && Pages.list({ filter: `site = "${site.id}" && slug = "${page_slug}"` })?.[0])
	$inspect({ site, current_page })

	let creating_site = $state(false)
	$effect(() => {
		if (!creating_site && sites?.length === 0) {
			creating_site = true
		}
	})
</script>

{#if creating_site}
	<CreateSite
		oncreated={() => {
			creating_site = false
		}}
	/>
{:else if site && current_page}
	<Primo {site} currentPage={current_page}>
		{@render children?.()}
	</Primo>
{:else}
	<div style="display: flex; justify-content: center; align-items: center; height: 100vh; color: white;">Loading...</div>
{/if}
