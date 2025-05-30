<script>
	import { goto } from '$app/navigation'
	import { self } from '$lib/pocketbase/PocketBase'
	import { onMount } from 'svelte'

	onMount(async () => {
		if (self.authStore.isValid) {
			await goto('/dashboard')
		}
	})

	let { children } = $props()
</script>

{@render children?.()}
