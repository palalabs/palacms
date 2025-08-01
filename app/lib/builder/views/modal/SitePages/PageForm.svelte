<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { fade } from 'svelte/transition'
	import UI from '../../../ui'
	import Icon from '@iconify/svelte'
	import { validate_url } from '../../../utilities'
	import { Page } from '$lib/common/models/Page'
	import { page } from '$app/state'
	import { Sites, PageTypes, Pages } from '$lib/pocketbase/collections'
	import type { ObjectOf } from '$lib/pocketbase/CollectionMapping'

	let { parent }: { parent?: ObjectOf<typeof Pages> } = $props()

	const host = $derived(page.url.host)
	const site = $derived(Sites.list({ filter: `host = "${host}"` })?.[0])
	const page_types = $derived(site?.page_types())

	const dispatch = createEventDispatcher()

	// set page type equal to the last type used under this parent
	const default_page_type_id = $derived(parent?.children()?.[0]?.page_type ?? site?.page_types()?.[0]?.id ?? '')

	let new_page = $state<Omit<Page, 'id' | 'parent' | 'site'>>({
		name: '',
		slug: '',
		page_type: ''
	})
	$effect.pre(() => {
		new_page = {
			name: '',
			slug: '',
			page_type: default_page_type_id
		}
	})

	let page_creation_disabled = $derived(!new_page.name || !new_page.slug)

	let page_label_edited = $state(false)
	$effect(() => {
		new_page.slug = page_label_edited ? validate_url(new_page.slug) : validate_url(new_page.name)
	})
</script>

<form
	onsubmit={(e) => {
		e.preventDefault()
		dispatch('create', new_page)
	}}
	in:fade={{ duration: 100 }}
	class:has-page-types={!!page_types?.length}
>
	<UI.TextInput autofocus={true} bind:value={new_page.name} id="page-label" label="Page Name" placeholder="About Us" />
	<UI.TextInput bind:value={new_page.slug} id="page-slug" label="Page Slug" oninput={() => (page_label_edited = true)} placeholder="about-us" />
	{#if site?.page_types()}
		<UI.Select
			fullwidth={true}
			label="Page Type"
			value={new_page.page_type}
			options={page_types?.map((p) => ({ value: p.id, icon: p.icon, label: p.name }))}
			on:input={({ detail: page_type_id }) => (new_page.page_type = page_type_id)}
		/>
	{/if}
	<button disabled={page_creation_disabled}>
		<Icon icon="akar-icons:check" />
	</button>
</form>

<style lang="postcss">
	form {
		padding: 0.25rem;
		display: grid;
		grid-template-columns: 1fr 1fr auto;
		gap: 0.5rem;
		padding: 0.825rem 1.125rem;
		align-items: flex-end;
		background: #1a1a1a;
		--TextInput-label-font-size: 0.75rem;

		&.has-page-types {
			grid-template-columns: 1fr 1fr 1fr auto;
		}

		button {
			border: 1px solid var(--weave-primary-color);
			border-radius: 0.25rem;
			padding: 9px 0.75rem;
			margin-top: 23px;

			&:disabled {
				opacity: 20%;
			}
		}
	}
</style>
