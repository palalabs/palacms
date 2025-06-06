<script>
	import Icon from '@iconify/svelte'

	let { stage = $bindable() } = $props()

	let error = $state(null)
	async function publish_site() {
		// TODO: Implement
	}

	stage = 'INITIAL'

	let loading = $state(false)
</script>

<!-- <ModalHeader title="Publish" icon="entypo:publish" /> -->
<div class="Deploy primo-reset">
	{#if stage === 'INITIAL'}
		<div class="container">
			<p class="description">
				<!-- TODO: Implement -->
				Your website is live at
				<a href="#" target="blank">TODO</a>
			</p>
			<div class="buttons">
				<button class="primo-button primary" onclick={publish_site}>
					<Icon icon={loading ? 'line-md:loading-twotone-loop' : 'entypo:publish'} />
					<span>Publish Changes</span>
				</button>
			</div>
		</div>
	{:else if stage === 'PUBLISHED'}
		<p class="description">
			<!-- TODO: Implement -->
			Your website changes have been published to
			<a href="#" target="blank">TODO</a>
		</p>
	{:else if stage === 'ERROR'}
		<p class="error">{error}</p>
	{/if}
</div>

<style lang="postcss">
	.Deploy.primo-reset {
		color: white;
		background: var(--primo-color-black);
		padding: 1.125rem 1.25rem;
		display: grid;
		gap: 1rem;
		width: 100%;
	}
	.container {
		display: grid;
		gap: 1rem;
	}

	/* .dns-record {
		background: var(--color-gray-9);
		border-radius: var(--primo-border-radius);
		margin-bottom: 1rem;

		.label {
			padding-left: 1rem;
			padding-top: 0.75rem;
			font-size: 0.875rem;
			border-bottom: 1px solid #121212;
			padding-bottom: 0.5rem;
			display: flex;
			align-items: center;
			gap: 0.5rem;
		}

		.contents {
			display: grid;
			grid-template-columns: 1fr 3fr 3fr;
			gap: 0.5rem;
			padding: 1rem;
		}
	} */

	.error {
		padding: 0.5rem;
		background: var(--primo-color-danger);
	}

	.description {
		a {
			text-decoration: underline;
		}
	}

	.buttons {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		gap: 1rem;
	}
	.primo-button {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 7px 16px;
		background: var(--primo-color-codeblack);
		border-radius: 0.25rem;
		justify-self: start;
		/* height: 100%; */
	}
	.primo-button.primary {
		border: 1px solid #70809e;
		background: transparent;
	}
	:global(form > label) {
		flex: 1;
	}
</style>
