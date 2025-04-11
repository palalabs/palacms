<script>
	import ModalHeader from '../ModalHeader.svelte'
	import Page_Types_List from './Page_Types_List/Page_Types_List.svelte'
	import Icon from '@iconify/svelte'
</script>

<ModalHeader>
	{#snippet title()}
		<div class="title">
			<Icon icon="carbon:template" />
			<span>Page Types</span>
		</div>
	{/snippet}
</ModalHeader>

<main>
	<Page_Types_List />
</main>

<style lang="postcss">
	.title {
		font-size: 0.875rem;
		padding: 0.75rem 1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: 0.1s;
	}
	main {
		padding: 1rem;
		padding-top: 0.5rem;
		background: var(--primo-color-black);
		overflow-y: scroll;
	}
</style>
