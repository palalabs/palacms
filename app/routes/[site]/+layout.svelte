<script>
	import Primo from '$lib/builder/Primo.svelte'
	import { self } from '$lib/pocketbase/PocketBase'
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import { Sites } from '$lib/pocketbase/collections'

	onMount(async () => {
		if (!self.authStore.isValid) {
			await goto('/auth')
		}
	})

	let { children } = $props()

	const site_id = $derived(page.params.site)
	const page_slug = $derived(page.params.page)
	const site = $derived(Sites.one(site_id))
	const currentPage = $derived(site?.pages().find((p) => p.slug === page_slug))
</script>

{#if site}
	<Primo {site} {currentPage}>
		{@render children?.()}
	</Primo>
{/if}
