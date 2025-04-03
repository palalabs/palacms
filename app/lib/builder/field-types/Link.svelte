<script lang="ts">
	import * as _ from 'lodash-es'
	import Icon from '@iconify/svelte'
	import UI from '../ui'
	import { locale } from '../stores/app'
	import type { Id } from '$lib/common/models/Id'
	import type { Resolved } from '$lib/pocketbase/CollectionStore'
	import type { LinkField } from '$lib/common/models/fields/LinkField'
	import { page } from '$app/state'
	import { require_site } from '$lib/loaders'
	import { get_direct_entries } from '../stores/helpers'
	import { ID } from '$lib/common/constants'

	const default_value = {
		label: '',
		url: '',
		active: false
	}

	const { entity_id, field }: { entity_id: Id; field: Resolved<typeof LinkField> } = $props()
	const site_id = $derived(page.params.site)
	const site = $derived(require_site(site_id))
	const entry = $derived(get_direct_entries(entity_id, field)[0])
	const selectable_pages = $derived(Object.values($site?.data.entities.pages ?? {}).filter((p) => p?.page_type[ID] === field.page_type[ID]))

	let selected = $state(urlMatchesPage(entry?.value.url))

	function urlMatchesPage(url) {
		if (url && url.startsWith('/')) {
			return 'page'
		} else {
			return 'url'
		}
	}

	let selected_page = $derived(entry.value.page ?? $site?.data.root)
	function get_page_url(page) {
		const prefix = $locale === 'en' ? '/' : `/${$locale}/`
		if (page.slug === '') {
			return prefix
		} else {
			let parent_urls = []
			return parent_urls.length ? prefix + parent_urls.join('/') + '/' + page.slug : prefix + page.slug
		}
	}
</script>

<div class="Link">
	<div class="inputs">
		<UI.TextInput
			label={field.label}
			oninput={(text) => {
				entry.value.label = text
			}}
			value={entry.value.label}
			id="page-label"
			placeholder="About Us"
		/>
		<div class="url-select">
			<div class="toggle">
				<button class:active={selected === 'page'} onclick={() => (selected = 'page')}>
					<Icon icon="iconoir:multiple-pages" />
					<span>Page</span>
				</button>
				<button class:active={selected === 'url'} onclick={() => (selected = 'url')}>
					<Icon icon="akar-icons:link-chain" />
					<span>URL</span>
				</button>
			</div>
			{#if selected === 'page'}
				<UI.Select
					value={selected_page}
					options={[$site?.data.root]}
					on:input={({ detail: page }) => {
						selected_page = page
					}}
				/>
			{:else}
				<UI.TextInput
					oninput={(text) => {
						entry.value.url = text
					}}
					value={entry.value.url}
					type="url"
					placeholder="https://palacms.org"
				/>
			{/if}
		</div>
	</div>
</div>

<style lang="postcss">
	.Link {
		display: flex;
		flex-direction: column;
	}

	.toggle {
		display: flex;
		background: var(--color-gray-9);
		border: 1px solid var(--color-gray-8);
		padding: 2px;
		border-radius: var(--primo-border-radius);
		--Dropdown-font-size: 0.875rem;

		button {
			border-radius: var(--primo-border-radius);
			font-size: 0.875rem;
			flex: 1;
			background: var(--color-gray-8);
			color: #8a8c8e;
			padding: 0.25rem 0.5rem;
			font-weight: 500;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 0.5rem;
			transition: 0.1s;
			background: transparent;

			&:focus,
			&.active {
				color: white;
				background: var(--color-gray-8);
				/* z-index: 1; */
			}
		}
	}

	.inputs {
		display: grid;
		gap: 0.5rem;
		width: 100%;

		.url-select {
			display: flex;
			gap: 0.25rem;
			flex-wrap: wrap;
		}
	}
</style>
