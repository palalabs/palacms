<script>
	import { goto } from '$app/navigation'
	import { self } from '$lib/pocketbase/PocketBase'
	import { onMount } from 'svelte'

	onMount(async () => {
		if (self.authStore.isValid) {
			await goto('/dashboard/sites', { replaceState: true })
		} else {
			await goto('/auth', { replaceState: true })
		}
	})
</script>
