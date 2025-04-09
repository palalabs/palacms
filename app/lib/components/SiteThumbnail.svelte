<script lang="ts">
	import SitePreview from '$lib/components/SitePreview.svelte'
	import { EllipsisVertical, SquarePen, Trash2, Download, Loader, ArrowLeftRight } from 'lucide-svelte'
	import { find as _find } from 'lodash-es'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import * as RadioGroup from '$lib/components/ui/radio-group'
	import { Label } from '$lib/components/ui/label'
	import { Button } from '$lib/components/ui/button'
	import * as Dialog from '$lib/components/ui/dialog'
	import { Input } from '$lib/components/ui/input'
	import * as AlertDialog from '$lib/components/ui/alert-dialog'
	import { require_site_groups, require_site_list } from '$lib/loaders'
	import { Sites } from '$lib/pocketbase/collections'
	import type { Resolved } from '$lib/pocketbase/Resolved'
	import type { Site } from '$lib/common/models/Site'

	let { site }: { site: Pick<Resolved<typeof Site>, 'id' | 'name' | 'group'> } = $props()
	const site_groups = require_site_groups()

	async function download_site_file() {
		// TODO: Implement
		throw new Error('Not implemented')
	}

	let is_rename_open = $state(false)
	let is_delete_open = $state(false)
	let new_name = $state('')
	$effect(() => {
		new_name = site.name || ''
	})

	async function handle_rename() {
		await Sites.update(site.id, { name: new_name })
		require_site_list.refresh()
		is_rename_open = false
	}

	let deleting = $state(false)
	async function delete_site() {
		is_delete_open = false
		await Sites.delete(site.id)
		require_site_list.refresh()
	}

	let is_move_open = $state(false)
	let selected_group_id = $state(site.group ?? $site_groups[0].id ?? '')
	async function move_site() {
		await Sites.update(site.id, { group: selected_group_id })
		require_site_list.refresh()
		is_move_open = false
	}
</script>

<Dialog.Root bind:open={is_move_open}>
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

<div class="space-y-3 relative w-full bg-gray-900">
	<div class="rounded-tl rounded-tr overflow-hidden">
		<a data-sveltekit-prefetch href="/{site.id}">
			<SitePreview />
		</a>
	</div>
	<div class="absolute -bottom-2 rounded-bl rounded-br w-full p-3 z-20 bg-gray-900 truncate flex items-center justify-between">
		<a data-sveltekit-prefetch href="/{site.id}" class="text-sm font-medium leading-none hover:underline">{site.name}</a>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				<EllipsisVertical size={14} />
			</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				<DropdownMenu.Item onclick={() => (is_rename_open = true)}>
					<SquarePen class="h-4 w-4" />
					<span>Rename</span>
				</DropdownMenu.Item>
				<DropdownMenu.Item onclick={() => (is_move_open = true)}>
					<ArrowLeftRight class="h-4 w-4" />
					<span>Move</span>
				</DropdownMenu.Item>
				<DropdownMenu.Item onclick={download_site_file}>
					<Download class="h-4 w-4" />
					<span>Download</span>
				</DropdownMenu.Item>
				<DropdownMenu.Item onclick={() => (is_delete_open = true)} class="text-red-500 hover:text-red-600 focus:text-red-600">
					<Trash2 class="h-4 w-4" />
					<span>Delete</span>
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</div>

<Dialog.Root bind:open={is_rename_open}>
	<Dialog.Content class="sm:max-w-[425px] pt-12 gap-0">
		<h2 class="text-lg font-semibold leading-none tracking-tight">Rename Site</h2>
		<p class="text-muted-foreground text-sm">Enter a new name for your site</p>
		<form onsubmit={handle_rename}>
			<Input bind:value={new_name} placeholder="Enter new site name" class="my-4" />
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (is_rename_open = false)}>Cancel</Button>
				<Button type="submit">Rename</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<AlertDialog.Root bind:open={is_delete_open}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you sure?</AlertDialog.Title>
			<AlertDialog.Description>
				This action cannot be undone. This will permanently delete <strong>{site.name}</strong>
				and remove all associated data.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={delete_site} class="bg-red-600 hover:bg-red-700">
				{#if deleting}
					<div class="animate-spin absolute">
						<Loader />
					</div>
				{:else}
					Delete {site.name}
				{/if}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
