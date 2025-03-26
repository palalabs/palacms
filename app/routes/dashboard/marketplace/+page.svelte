<script>
	import { goto } from '$app/navigation'
	import { onMount } from 'svelte'

	onMount(async () => {
		await goto('/marketplace/starters')
	})
</script>
