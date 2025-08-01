<script lang="ts">
	import * as _ from 'lodash-es'
	import { Building2, LayoutTemplate, Check } from 'lucide-svelte'
	import SitePreview from '$lib/components/SitePreview.svelte'
	import * as Tabs from '$lib/components/ui/tabs'
	import { Input } from '$lib/components/ui/input/index.js'
	import { Label } from '$lib/components/ui/label/index.js'
	import { Site } from '$lib/common/models/Site'
	import { Sites, PageTypes, Pages, SiteSymbols, PageSections, PageTypeSections, SiteGroups, manager } from '$lib/pocketbase/collections'
	import { page as pageState } from '$app/state'
	import type { PageType } from '$lib/common/models/PageType'
	import type { Page } from '$lib/common/models/Page'
	import Button from './ui/button/button.svelte'
	import { user } from '$lib/pocketbase/PocketBase'

	const { oncreated }: { oncreated?: () => void } = $props()

	const site_groups = $derived(SiteGroups.list({ filter: `name = "Default"` }))
	const site_group = $derived(site_groups?.[0])
	$effect(() => {
		// Create default site group if it does not exist
		if (site_groups?.length !== 0) {
			return
		}

		const currentUser = user()
		if (!currentUser) {
			return
		}

		SiteGroups.create({
			name: 'Default',
			index: 0,
			owner: currentUser.id
		})
		manager.commit()
	})

	const starter_sites = $derived(Sites.list() ?? [])

	let site_name = $state(``)

	let preview = $state(``)

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
		if (!selected_starter_id || !site_group) return
		loading = true
		if (selected_starter_id === 'blank') {
			const site = Sites.create({
				...blank_site,
				name: site_name,
				description: '',
				host: pageState.url.host,
				group: site_group.id,
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

			await manager.commit()
			oncreated?.()
		}
	}
</script>

<div class="max-w-[1600px] h-full max-h-[100vh] flex flex-col p-4 mx-auto">
	<div class="grid grid-cols-3 items-center mb-2">
		<div class="ml-4"></div>
		<h1 class="font-semibold leading-none tracking-tight text-center">Create Site</h1>
		<Button onclick={create_site} disabled={loading || !completed} class="justify-self-end inline-flex justify-center items-center">Done</Button>
	</div>

	<Tabs.Root value="identity" class="w-full flex-1 flex flex-col gap-2 overflow-hidden">
		<Tabs.List class="w-full flex">
			<Tabs.Trigger value="identity" class="flex-1 flex items-center gap-2">
				<Building2 class="h-5 w-5" />
				Identity
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
</div>

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
	.split-container {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
		overflow: hidden;
	}
</style>
