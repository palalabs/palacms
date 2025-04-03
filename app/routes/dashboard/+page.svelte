<script>
	import { goto, replaceState } from '$app/navigation'
	import { onMount } from 'svelte'

	onMount(async () => {
		await goto('/dashboard/sites', { replaceState: true })
	})
</script>
