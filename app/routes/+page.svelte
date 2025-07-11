<script>
	import { goto } from '$app/navigation'
	import { self } from '$lib/pocketbase/PocketBase'
	import { onMount } from 'svelte'

	onMount(async () => {
		if (self.authStore.isValid) {
			await goto('/admin/site', { replaceState: true })
		} else {
			await goto('/admin/auth', { replaceState: true })
		}
	})
</script>
