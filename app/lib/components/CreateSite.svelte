<script lang="ts">
	import * as _ from 'lodash-es'
	import { Building2, Palette, LayoutTemplate, Upload, Check } from 'lucide-svelte'
	import * as Dialog from '$lib/components/ui/dialog'
	import SitePreview from '$lib/components/SitePreview.svelte'
	import * as Tabs from '$lib/components/ui/tabs'
	import { Input } from '$lib/components/ui/input/index.js'
	import { Label } from '$lib/components/ui/label/index.js'
	import DesignFields from './Modals/DesignFields.svelte'
	import * as code_generators from '$lib/builder/code_generators'
	import { Site } from '$lib/common/models/Site'
	import { Sites, SiteGroups, PageTypes, Pages, SiteSymbols, PageSections, PageTypeSections } from '$lib/pocketbase/collections'
	import { page } from '$app/state'
	import type { PageType } from '$lib/common/models/PageType'
	import type { Page } from '$lib/common/models/Page'

	let { onclose } = $props()

	const site_group_id = $derived(page.url.searchParams.get('group'))
	const starter_sites = $derived(Sites.list() ?? [])
	const active_site_group = $derived(site_group_id && SiteGroups.one(site_group_id))

	let site_name = $state(``)

	let preview = $state(``)

	let design_values = $state({
		heading_font: 'Merriweather',
		body_font: 'Open Sans',
		primary_color: '#bc2020',
		radius: '8px',
		shadow: '0px 4px 30px rgba(0, 0, 0, 0.2)'
	})
	let design_variables_css = $derived(code_generators.site_design_css(design_values))
	function update_design_value(token, value) {
		design_values[token] = value
	}

	let selected_starter_id = $state(``)
	function select_starter(site_id) {
		selected_starter_id = site_id
		preview = ''
	}

	const blank_site = {
		head: '',
		foot: ''
	} satisfies Partial<Site>

	const blank_site_home_page_type = {
		name: 'Home',
		head: '',
		foot: '',
		color: '',
		icon: ''
	} satisfies Partial<PageType>

	const black_site_home_page = {
		name: 'Home',
		slug: '',
		parent: ''
	} satisfies Partial<Page>

	let completed = $derived(!!site_name && selected_starter_id)
	let loading = $state(false)
	async function create_site() {
		if (!selected_starter_id || !active_site_group) return
		loading = true
		if (selected_starter_id === 'blank') {
			const site = Sites.create({
				...blank_site,
				name: site_name,
				description: '',
				group: active_site_group.id,
				index: 0
			})
			const page_type = PageTypes.create({
				...blank_site_home_page_type,
				name: 'Default',
				site: site.id
			})
			const page = Pages.create({
				...black_site_home_page,
				page_type: page_type.id,
				site: site.id
			})

			// Create a default "Welcome" symbol for the homepage
			const welcome_symbol = SiteSymbols.create({
				name: 'Welcome',
				html: '<div class="welcome"><h1>Welcome to Pala</h1><p>Start building your site by editing this content.</p></div>',
				css: '.welcome { padding: 2rem; text-align: center; }\n.welcome h1 { margin-bottom: 1rem; }',
				js: '',
				site: site.id
			})

			PageTypeSections.create({
				symbol: welcome_symbol.id,
				index: 0,
				page_type: page_type.id,
				zone: 'body'
			})

			await Sites.commit()
			await PageTypes.commit()
			await Pages.commit()
			await SiteSymbols.commit()
			await PageSections.commit()
			await PageTypeSections.commit()
		}

		onclose()
	}
</script>

<Dialog.Header
	class="mb-2"
	title="Create Site"
	button={{
		label: 'Done',
		onclick: create_site,
		loading,
		disabled: loading || !completed
	}}
/>

<Tabs.Root value="identity" class="w-full flex-1 flex flex-col gap-2 overflow-hidden">
	<Tabs.List class="w-full flex">
		<Tabs.Trigger value="identity" class="flex-1 flex items-center gap-2">
			<Building2 class="h-5 w-5" />
			Identity
		</Tabs.Trigger>
		<Tabs.Trigger value="design" class="flex-1 flex items-center gap-2">
			<Palette class="h-5 w-5" />
			Design
		</Tabs.Trigger>
		<Tabs.Trigger value="starter" class="flex-1 flex items-center gap-2">
			<LayoutTemplate class="h-5 w-5" />
			Starter Site
		</Tabs.Trigger>
	</Tabs.List>

	<div class="flex-1 max-h-[82vh]">
		<Tabs.Content value="identity" class="p-1">
			<div class="grid w-full items-center gap-1.5">
				<Label for="site-name">Site Name</Label>
				<Input type="text" id="site-name" bind:value={site_name} />
			</div>
		</Tabs.Content>

		<Tabs.Content value="design" class="h-full">
			<div class="grid grid-cols-2 h-full gal-4">
				<div class="space-y-2 overflow-y-auto">
					<DesignFields values={design_values} oninput={(token, val) => update_design_value(token, val)} />
				</div>
				<div class="design-preview border">
					{@html design_variables_css}
					<h1>{site_name || 'Welcome to Pala'}</h1>
					<h2>We're happy you're here</h2>
					<button>Button</button>
				</div>
			</div>
		</Tabs.Content>

		<Tabs.Content value="starter" class="h-full">
			<div class="flex flex-col h-full space-y-2">
				<div class="flex justify-between items-center">
					<h3>Choose a Starter Site</h3>
					<!-- <Button variant="outline" size="sm">
						<label class="flex items-center gap-2 cursor-pointer">
							<input onchange={duplicate_site_file} type="file" class="sr-only" />
							<Upload class="h-4 w-4" />
							Duplicate from site file
						</label>
					</Button> -->
				</div>
				<div class="split-container flex-1">
					<div class="h-[77vh] overflow-auto">
						<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{@render StarterButton({
								id: 'blank',
								name: 'Blank',
								data: blank_site
							})}
							{#each starter_sites as site}
								{@render StarterButton(site)}
							{/each}
						</div>
					</div>
					<div style="background: #222;" class="rounded">
						<!-- <SitePreview style="height: 100%" site_id={selected_starter_id} {preview} append={design_variables_css} /> -->
					</div>
				</div>
			</div>
		</Tabs.Content>
	</div>
</Tabs.Root>

{#snippet StarterButton(site)}
	<button onclick={() => select_starter(site.id)} class="space-y-3 relative w-full bg-gray-900 rounded overflow-hidden">
		<div class="relative">
			<SitePreview />
			{#if selected_starter_id === site.id}
				<div class="bg-black/70 absolute inset-0 w-full h-full flex items-center justify-center">
					<Check />
				</div>
			{/if}
		</div>
		<div class="absolute bottom-0 w-full p-3 z-20 bg-gray-900 truncate flex items-center justify-between">
			<div class="text-sm font-medium leading-none">{site.name}</div>
		</div>
	</button>
{/snippet}

<style lang="postcss">
	.design-preview {
		background: white;
		color: #222;
		padding: 2rem;
		border-radius: var(--theme-radius);
		h1 {
			font-size: 2rem;
			font-family: var(--theme-heading-font);
		}
		h2 {
			font-size: 1.125rem;
			font-family: var(--theme-body-font);
			margin-bottom: 1rem;
		}
		button {
			padding: 0.25rem 0.75rem;
			background: var(--theme-primary-color);
			color: white;
			border-radius: var(--theme-radius);
		}
	}
	.split-container {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
		overflow: hidden;
	}
</style>
