<script>
	import Primo from '$lib/builder/Primo.svelte'
	import { show } from '$lib/components/Modal.svelte'
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

<Primo
	{site}
	on:publish={() => show({ id: 'DEPLOY', options: { max_width: '700px' } })}
	primary_buttons={[
		{
			icon: 'solar:pallete-2-bold',
			label: 'Design',
			onclick: () => show({ id: 'DESIGN', options: { height: '100%' } })
		}
	]}
	secondary_buttons={[
		{
			icon: 'clarity:users-solid',
			label: 'Editors',
			onclick: () => {
				show({
					id: 'COLLABORATION',
					options: { max_width: '500px' }
				})
			}
		}
	]}
>
	{@render children?.()}
</Primo>
