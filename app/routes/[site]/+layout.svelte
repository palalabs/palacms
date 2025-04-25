<script>
	import Primo from '$lib/builder/Primo.svelte'
	import { pb } from '$lib/pocketbase/PocketBase'
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import { require_site } from '$lib/loaders'

	onMount(async () => {
		if (!pb.authStore.isValid) {
			await goto('/auth')
		}
	})

	let { children } = $props()

	const site_id = $derived(page.params.site)
	const site = $derived(require_site(site_id))
</script>

<Primo {site}>
	{@render children?.()}
</Primo>
