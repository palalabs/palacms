<script>
	import { goto } from '$app/navigation'
	import { onMount } from 'svelte'

	onMount(async () => {
		await goto('/admin/dashboard/marketplace/starters', { replaceState: true })
	})
</script>
