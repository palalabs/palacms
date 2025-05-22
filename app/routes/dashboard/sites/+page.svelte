<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog'
	import * as Sidebar from '$lib/components/ui/sidebar'
	import * as AlertDialog from '$lib/components/ui/alert-dialog'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import * as RadioGroup from '$lib/components/ui/radio-group'
	import { Label } from '$lib/components/ui/label'
	import SitePreview from '$lib/components/SitePreview.svelte'
	import { Input } from '$lib/components/ui/input'
	import EmptyState from '$lib/components/EmptyState.svelte'
	import { Separator } from '$lib/components/ui/separator'
	import { Button } from '$lib/components/ui/button'
	import { CirclePlus, Globe, Loader, ChevronDown, SquarePen, Trash2, EllipsisVertical, ArrowLeftRight, Download } from 'lucide-svelte'
	import CreateSite from '$lib/components/CreateSite.svelte'
	import { useSidebar } from '$lib/components/ui/sidebar'
	import { page } from '$app/state'
	import type { Site } from '$lib/common/models/Site'
	import { Sites, SiteGroups } from '$lib/pocketbase/collections'
	const sidebar = useSidebar()

	const site_group_id = $derived(page.url.searchParams.get('group')!)
	// const site_groups = $derived(SiteGroups.list())
	const active_site_group = $derived(SiteGroups.one(site_group_id))
	const sites = $derived(active_site_group?.sites())

	let creating_site = $state(false)

	let is_rename_group_open = $state(false)
	let new_group_name = $state('')
	$effect(() => {
		if (active_site_group) {
			new_group_name = active_site_group.name
		}
	})
	async function handle_group_rename(e) {
		e.preventDefault()
		if (!active_site_group) return
		await SiteGroups.update(active_site_group.id, { name: new_group_name })
		// require_site_groups.refresh()
		is_rename_group_open = false
	}

	let is_delete_group_open = $state(false)
	let deleting_group = $state(false)
	async function handle_group_delete() {
		deleting_group = true
		if (!active_site_group) return
		await SiteGroups.delete(active_site_group.id)
		// require_site_groups.refresh()
		deleting_group = false
		is_delete_group_open = false
	}

	async function download_site_file() {
		// TODO: Implement
		throw new Error('Not implemented')
	}

	let is_rename_site_open = $state(false)
	let new_site_name = $state('')
	let current_site: Site | null = $state(null)

	$effect(() => {
		if (current_site) {
			new_site_name = current_site.name || ''
		}
	})

	async function handle_rename() {
		if (!current_site) return
		await Sites.update(current_site.id, { name: new_site_name })
		require_site_list.refresh()
		is_rename_site_open = false
	}

	let is_delete_site_open = $state(false)
	let deleting_site = $state(false)
	async function delete_site() {
		if (!current_site) return
		deleting_site = true
		await Sites.delete(current_site.id)
		require_site_list.refresh()
		is_delete_site_open = false
		deleting_site = false
	}

	let is_move_site_open = $state(false)
	let selected_group_id = $state($site_groups[0]?.id ?? '')
	async function move_site() {
		if (!current_site) return
		await Sites.update(current_site.id, { group: selected_group_id })
		require_site_list.refresh()
		is_move_site_open = false
	}
</script>

<header class="flex h-14 shrink-0 items-center gap-2">
	<div class="flex flex-1 items-center gap-2 px-3">
		<Sidebar.Trigger />
		<Separator orientation="vertical" class="mr-2 h-4" />
		<div class="text-sm">{active_site_group?.name}</div>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<button {...props}>
						<ChevronDown class="h-4" />
						<span class="sr-only">More</span>
					</button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content class="w-56 rounded-lg" side="bottom" align={sidebar.isMobile ? 'end' : 'start'}>
				<DropdownMenu.Item onclick={() => (is_rename_group_open = true)}>
					<SquarePen class="text-muted-foreground" />
					<span>Rename</span>
				</DropdownMenu.Item>
				{#if $site_groups?.length}
					<DropdownMenu.Item onclick={() => (is_delete_group_open = true)}>
						<Trash2 class="text-muted-foreground" />
						<span>Delete</span>
					</DropdownMenu.Item>
				{/if}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
	<div class="ml-auto mr-4">
		<Button size="sm" variant="outline" onclick={() => (creating_site = true)}>
			<CirclePlus class="h-4 w-4" />
			Create Site
		</Button>
		<Dialog.Root bind:open={creating_site}>
			<Dialog.Content class="max-w-[1600px] h-full max-h-[100vh] flex flex-col p-4">
				<CreateSite onclose={() => (creating_site = false)} />
			</Dialog.Content>
		</Dialog.Root>
	</div>
</header>
<div class="flex flex-1 flex-col gap-4 px-4 pb-4">
	{#if $sites?.length}
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each $sites as site}
				{@render SiteButton(site)}
			{/each}
		</div>
	{:else}
		<EmptyState icon={Globe} title="No Sites to display" description="It looks like you haven't created any websites yet." />
	{/if}
</div>

{#snippet SiteButton(site)}
	<div class="space-y-3 relative w-full bg-gray-900">
		<div class="rounded-tl rounded-tr overflow-hidden">
			<a data-sveltekit-prefetch href="/{site.id}">
				<SitePreview site_id={site.id} />
			</a>
		</div>
		<div class="absolute -bottom-2 rounded-bl rounded-br w-full p-3 z-20 bg-gray-900 truncate flex items-center justify-between">
			<a data-sveltekit-prefetch href="/{site.id}" class="text-sm font-medium leading-none">{site.name}</a>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<EllipsisVertical size={14} />
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<DropdownMenu.Item
						onclick={() => {
							current_site = site
							is_rename_site_open = true
						}}
					>
						<SquarePen class="h-4 w-4" />
						<span>Rename</span>
					</DropdownMenu.Item>
					{#if $site_groups.length > 1}
						<DropdownMenu.Item
							onclick={() => {
								current_site = site
								is_move_site_open = true
							}}
						>
							<ArrowLeftRight class="h-4 w-4" />
							<span>Move</span>
						</DropdownMenu.Item>
					{/if}
					<DropdownMenu.Item onclick={download_site_file}>
						<Download class="h-4 w-4" />
						<span>Download</span>
					</DropdownMenu.Item>
					<DropdownMenu.Item
						onclick={() => {
							current_site = site
							is_delete_site_open = true
						}}
						class="text-red-500 hover:text-red-600 focus:text-red-600"
					>
						<Trash2 class="h-4 w-4" />
						<span>Delete</span>
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</div>
{/snippet}

<Dialog.Root bind:open={is_rename_group_open}>
	<Dialog.Content class="sm:max-w-[425px] pt-12 gap-0">
		<h2 class="text-lg font-semibold leading-none tracking-tight">Rename group</h2>
		<p class="text-muted-foreground text-sm">Enter a new name for your group</p>
		<form onsubmit={handle_group_rename}>
			<Input bind:value={new_group_name} placeholder="Enter new group name" class="my-4" />
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (is_rename_group_open = false)}>Cancel</Button>
				<Button type="submit">Rename</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<AlertDialog.Root bind:open={is_delete_group_open}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you sure?</AlertDialog.Title>
			<AlertDialog.Description>
				This action cannot be undone. This will permanently delete <strong>{active_site_group?.name}</strong>
				and
				<strong>all</strong>
				its sites.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={handle_group_delete} class="bg-red-600 hover:bg-red-700">
				{#if deleting_group}
					<div class="animate-spin absolute">
						<Loader />
					</div>
				{:else}
					Delete {active_site_group?.name}
				{/if}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<Dialog.Root bind:open={is_move_site_open}>
	<Dialog.Content class="sm:max-w-[425px] pt-12 gap-0">
		<div class="grid gap-4">
			<div class="space-y-2">
				<h4 class="font-medium leading-none">Move to group</h4>
				<p class="text-muted-foreground text-sm">Select a group for this site</p>
			</div>
			<RadioGroup.Root bind:value={selected_group_id}>
				{#each $site_groups as group}
					<div class="flex items-center space-x-2">
						<RadioGroup.Item value={group.id} id={group.id} />
						<Label for={group.id}>{group.name}</Label>
					</div>
				{/each}
			</RadioGroup.Root>
			<div class="flex justify-end">
				<Button onclick={move_site}>Move</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={is_rename_site_open}>
	<Dialog.Content class="sm:max-w-[425px] pt-12 gap-0">
		<h2 class="text-lg font-semibold leading-none tracking-tight">Rename Site</h2>
		<p class="text-muted-foreground text-sm">Enter a new name for your site</p>
		<form onsubmit={handle_rename}>
			<Input bind:value={new_site_name} placeholder="Enter new site name" class="my-4" />
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (is_rename_site_open = false)}>Cancel</Button>
				<Button type="submit">Rename</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<AlertDialog.Root bind:open={is_delete_site_open}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you sure?</AlertDialog.Title>
			<AlertDialog.Description>
				This action cannot be undone. This will permanently delete <strong>{current_site?.name}</strong>
				and remove all associated data.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={delete_site} class="bg-red-600 hover:bg-red-700">
				{#if deleting_site}
					<div class="animate-spin absolute">
						<Loader />
					</div>
				{:else}
					Delete {current_site?.name}
				{/if}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
