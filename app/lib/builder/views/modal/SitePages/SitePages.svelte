<script>
	import ModalHeader from '../ModalHeader.svelte'
	import PageList from './PageList/PageList.svelte'
	import Icon from '@iconify/svelte'
</script>

<ModalHeader>
	{#snippet title()}
		<div class="title">
			<Icon icon="iconoir:multiple-pages" />
			<span>Pages</span>
		</div>
	{/snippet}
</ModalHeader>

<main>
	<PageList />
</main>

<style lang="postcss">
	.title {
		font-size: 0.875rem;
		padding: 0.75rem 1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	main {
		padding: 1rem;
		padding-top: 0.5rem;
		background: var(--primo-color-black);
		overflow-y: scroll;
	}
</style>
