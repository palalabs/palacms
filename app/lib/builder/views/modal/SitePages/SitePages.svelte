<script>
	import ModalHeader from '../ModalHeader.svelte'
	import PageList from './PageList/PageList.svelte'
	import Page_Types_List from './Page_Types_List/Page_Types_List.svelte'
	import Icon from '@iconify/svelte'
	import { editing_context } from '$lib/builder/stores/app/misc'
</script>

<ModalHeader>
	{#snippet title()}
		<!-- $userRole === 'DEV' -->
		{#if true}
			<div class="tabs">
				<button class="title" class:active={$editing_context === 'page'} onclick={() => ($editing_context = 'page')}>
					<Icon icon="iconoir:multiple-pages" />
					<span>Pages</span>
				</button>
				<button class="title" class:active={$editing_context === 'page_type'} onclick={() => ($editing_context = 'page_type')}>
					<Icon icon="carbon:template" />
					<span>Page Types</span>
				</button>
			</div>
		{:else}
			<div class="flex items-center gap-2">
				<Icon icon="iconoir:multiple-pages" />
				<span>Pages</span>
			</div>
		{/if}
	{/snippet}
</ModalHeader>

<main>
	{#if $editing_context === 'page'}
		<PageList />
	{:else}
		<Page_Types_List />
	{/if}
</main>

<style lang="postcss">
	.tabs {
		display: flex;
		justify-content: center;
		color: white;
	}
	.title {
		font-size: 0.875rem;
		padding: 0.75rem 1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		border-bottom: 1px solid #222;
		transition: 0.1s;

		&.active {
			border-bottom-color: var(--weave-primary-color);
		}
	}
	main {
		padding: 1rem;
		padding-top: 0.5rem;
		background: var(--primo-color-black);
		overflow-y: scroll;
	}
</style>
