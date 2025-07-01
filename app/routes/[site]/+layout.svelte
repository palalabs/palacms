<script>
	import Primo from '$lib/builder/Primo.svelte'
	import { self } from '$lib/pocketbase/PocketBase'
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import { Sites, Pages } from '$lib/pocketbase/collections'

	onMount(async () => {
		if (!self.authStore.isValid) {
			await goto('/auth')
		}
	})

	let { children } = $props()

	const site_id = $derived(page.params.site)
	const page_slug = $derived(page.params.page || '')

	const site = $derived(Sites.one(site_id))
	const currentPage = $derived(Pages.list({ filter: `site = "${site_id}" && slug = "${page_slug}"` })?.[0])
</script>

{#if site && currentPage}
	<Primo {site} {currentPage}>
		{@render children?.()}
	</Primo>
{:else}
	<div style="display: flex; justify-content: center; align-items: center; height: 100vh; color: white;">Loading...</div>
{/if}
