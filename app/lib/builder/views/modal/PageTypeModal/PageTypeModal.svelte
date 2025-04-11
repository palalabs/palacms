<script>
	import ModalHeader from '../ModalHeader.svelte'
	import Page_Types_List from './Page_Types_List/Page_Types_List.svelte'
	import Icon from '@iconify/svelte'
	import { editing_context } from '$lib/builder/stores/app/misc'
</script>

<ModalHeader>
	{#snippet title()}
		<button class="title" class:active={$editing_context === 'page_type'} onclick={() => ($editing_context = 'page_type')}>
			<Icon icon="carbon:template" />
			<span>Page Types</span>
		</button>
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
