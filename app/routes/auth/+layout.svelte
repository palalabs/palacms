<script>
	import { goto } from '$app/navigation'
	import { pb } from '$lib/pocketbase/PocketBase'
	import { onMount } from 'svelte'

	onMount(async () => {
		if (pb.authStore.isValid) {
			await goto('/dashboard')
		}
	})

	let { children } = $props()
</script>

{@render children?.()}
