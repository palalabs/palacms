<script>
	import { goto } from '$app/navigation'
	import { pb } from '$lib/pocketbase/PocketBase'
	import { onMount } from 'svelte'

	onMount(async () => {
		if (pb.authStore.isValid) {
			await goto('/dashboard/sites', { replaceState: true })
		} else {
			await goto('/auth', { replaceState: true })
		}
	})
</script>
