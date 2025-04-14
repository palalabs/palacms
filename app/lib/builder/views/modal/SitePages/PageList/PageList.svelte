<script lang="ts">
	import Item from './Item.svelte'
	import { require_site } from '$lib/loaders'
	import { page } from '$app/state'

	const site_id = $derived(page.params.site)
	const site = $derived(require_site(site_id))
</script>

<ul class="page-list root">
	<li>
		<Item page={$site?.data.root} active={false} />
	</li>
</ul>

<style lang="postcss">
	ul.page-list {
		display: grid;
		/* gap: 0.5rem; */
		color: var(--primo-color-white);

		margin-bottom: 0.5rem;

		li {
			/* overflow: hidden; */
		}

		/* &.root > li:not(:first-child) {
			border-top: 1px solid #222;
		} */
	}
</style>
