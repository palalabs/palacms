<script>
	import { goto } from '$app/navigation'
	import { onMount } from 'svelte'

	onMount(async () => {
		await goto('/dashboard/library/starters', { replaceState: true })
	})
</script>
