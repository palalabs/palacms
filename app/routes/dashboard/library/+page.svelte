<script lang="ts">
	import CreateBlock from '$lib/components/Modals/CreateBlock.svelte'
	import * as Sidebar from '$lib/components/ui/sidebar'
	import * as Dialog from '$lib/components/ui/dialog'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import * as AlertDialog from '$lib/components/ui/alert-dialog'
	import { Input } from '$lib/components/ui/input'
	import * as RadioGroup from '$lib/components/ui/radio-group'
	import { Label } from '$lib/components/ui/label'
	import { processCode } from '$lib/builder/utils.js'
	import { Separator } from '$lib/components/ui/separator'
	import { Button } from '$lib/components/ui/button'
	import EmptyState from '$lib/components/EmptyState.svelte'
	import { CirclePlus, Cuboid, Code, SquarePen, Trash2, ChevronDown, Loader, EllipsisVertical, ArrowLeftRight } from 'lucide-svelte'
	import SymbolButton from '$lib/components/SymbolButton.svelte'
	import { page } from '$app/state'
	import { goto } from '$app/navigation'
	import { useSidebar } from '$lib/components/ui/sidebar'
	import { LibrarySymbolGroups, LibrarySymbols } from '$lib/pocketbase/collections'
	import type { LibrarySymbol } from '$lib/common/models/LibrarySymbol'

	const active_symbol_group_id = $derived(page.url.searchParams.get('group'))
	const active_symbol_group = $derived(active_symbol_group_id ? LibrarySymbolGroups.one(active_symbol_group_id) : undefined)
	const symbol_groups = $derived(LibrarySymbolGroups.list() ?? [])

	// Get symbols for the active group using direct query instead of relationship method
	const group_symbols = $derived(active_symbol_group?.symbols() ?? [])

	const sidebar = useSidebar()

	let editing_head = $state(false)
	let creating_block = $state(false)

	// Create a fresh symbol object for new blocks
	let new_symbol = $state({ name: '', css: '', html: '', js: '' })

	function open_create_block() {
		// Reset to fresh symbol data
		new_symbol = { name: '', css: '', html: '', js: '' }
		creating_block = true
	}

	async function upload_block_file(event) {
		const file = event.target.files[0]
		if (!file) return
		// TODO: Implement
		throw new Error('Not implemented')
	}

	// TODO: Remove?
	let generated_head_code = $state('')

	async function compile_component_head(html) {
		const compiled = await processCode({
			component: {
				html,
				css: '',
				js: ''
			}
		})
		if (!compiled.error) {
			return compiled.head
		} else return ''
	}

	let loading = $state(false)
	async function save_settings() {
		loading = true

		editing_head = false
		loading = false
	}

	let is_rename_open = $state(false)
	let new_name = $state('')
	$effect(() => {
		if (active_symbol_group) {
			new_name = active_symbol_group.name
		}
	})
	async function handle_rename(e) {
		e.preventDefault()
		if (!active_symbol_group_id) return
		LibrarySymbolGroups.update(active_symbol_group_id, { name: new_name })
		LibrarySymbolGroups.commit()
		is_rename_open = false
	}

	let is_delete_open = $state(false)
	let deleting = $state(false)
	async function handle_delete() {
		deleting = true
		if (!active_symbol_group_id) return
		LibrarySymbolGroups.delete(active_symbol_group_id)
		await LibrarySymbolGroups.commit()
		await goto('/admin/dashboard/library')
		deleting = false
		is_delete_open = false
	}

	let symbol_being_edited: LibrarySymbol | null = $state(null)
	let is_symbol_editor_open = $state(false)

	function begin_symbol_edit(symbol: LibrarySymbol) {
		symbol_being_edited = symbol
		is_symbol_editor_open = true
	}

	// Symbol rename
	let symbol_being_renamed: LibrarySymbol | null = $state(null)
	let is_symbol_renamer_open = $state(false)

	function begin_symbol_rename(symbol: LibrarySymbol) {
		symbol_being_renamed = symbol
		new_name = symbol.name
		is_symbol_renamer_open = true
	}

	async function handle_symbol_rename(e) {
		e.preventDefault()
		if (!symbol_being_renamed) return
		symbol_being_renamed.name = new_name
		is_symbol_renamer_open = false
		symbol_being_renamed = null
	}

	// Symbol move
	let symbol_being_moved: LibrarySymbol | null = $state(null)
	let is_symbol_move_open = $state(false)
	let selected_group_id = $state('')

	function begin_symbol_move(symbol: LibrarySymbol) {
		symbol_being_moved = symbol
		const original_group_id = symbol.group
		selected_group_id = original_group_id ?? ''
		is_symbol_move_open = true
	}

	async function move_symbol() {
		if (!symbol_being_moved) return
		// Move implementation
		is_symbol_move_open = false
		symbol_being_moved = null
	}

	// Symbol delete
	let symbol_being_deleted: LibrarySymbol | null = $state(null)
	let is_delete_symbol_open = $state(false)

	function begin_symbol_delete(symbol: LibrarySymbol) {
		symbol_being_deleted = symbol
		is_delete_symbol_open = true
	}

	async function delete_library_symbol() {
		if (!symbol_being_deleted) return
		deleting = true
		LibrarySymbols.delete(symbol_being_deleted.id)
		await LibrarySymbols.commit()
		is_delete_symbol_open = false
		symbol_being_deleted = null
		deleting = false
	}

	async function save_symbol(data) {
		if (!symbol_being_edited) return
		// preview = data.preview
		LibrarySymbols.update(symbol_being_edited.id, data)
		LibrarySymbols.commit()
		is_symbol_editor_open = false
		// Give the modal time to close before nullifying the symbol
		setTimeout(() => {
			symbol_being_edited = null
		}, 200)
	}

	async function create_symbol(data) {
		if (!active_symbol_group_id) return
		try {
			// Remove id for creation and ensure required fields
			const { id, preview, ...symbolData } = data

			// Try creating with minimal required fields only
			const createData = {
				name: symbolData.name || 'Untitled Block',
				html: symbolData.html || '',
				css: symbolData.css || '',
				js: symbolData.js || '',
				group: active_symbol_group_id
			}
			console.log('Creating symbol with data:', createData)
			LibrarySymbols.create(createData)
			await LibrarySymbols.commit()
			creating_block = false
			// Reset the new_symbol after modal closes
			setTimeout(() => {
				new_symbol = { name: '', css: '', html: '', js: '' }
			}, 100)
		} catch (error) {
			console.error('Failed to create symbol:', error)
			console.error('Error details:', error.response?.data || error.data)
		}
	}
</script>

<!-- Symbol Group Dialogs -->
<Dialog.Root bind:open={is_rename_open}>
	<Dialog.Content class="sm:max-w-[425px] pt-12 gap-0">
		<h2 class="text-lg font-semibold leading-none tracking-tight">Rename group</h2>
		<p class="text-muted-foreground text-sm">Enter a new name for your group</p>
		<form onsubmit={handle_rename}>
			<Input bind:value={new_name} placeholder="Enter new group name" class="my-4" />
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
				This action cannot be undone. This will permanently delete <strong>{active_symbol_group?.name}</strong>
				and
				<strong>all</strong>
				it's blocks.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={handle_delete} class="bg-red-600 hover:bg-red-700">
				{#if deleting}
					<div class="animate-spin absolute">
						<Loader />
					</div>
				{:else}
					Delete {active_symbol_group?.name}
				{/if}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<header class="flex h-14 shrink-0 items-center gap-2">
	<div class="flex flex-1 items-center gap-2 px-3">
		<Sidebar.Trigger />
		<Separator orientation="vertical" class="mr-2 h-4" />
		<div class="text-sm">{active_symbol_group?.name}</div>
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
				<DropdownMenu.Item onclick={() => (is_rename_open = true)}>
					<SquarePen class="text-muted-foreground" />
					<span>Rename</span>
				</DropdownMenu.Item>
				<DropdownMenu.Item onclick={() => (is_delete_open = true)}>
					<Trash2 class="text-muted-foreground" />
					<span>Delete</span>
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
	<div class="ml-auto mr-4">
		<Button size="sm" variant="outline" onclick={open_create_block}>
			<CirclePlus class="h-4 w-4" />
			Create Block
		</Button>
	</div>
</header>

<div class="flex flex-1 flex-col gap-4 px-4 pb-4">
	{#if group_symbols.length}
		<div class="masonry">
			<ul>
				{#each group_symbols as symbol (symbol.id)}
					<li>
						<SymbolButton symbol_id={symbol.id} head={generated_head_code} onclick={() => begin_symbol_edit(symbol)}>
							<DropdownMenu.Root>
								<DropdownMenu.Trigger>
									<EllipsisVertical size={14} />
								</DropdownMenu.Trigger>
								<DropdownMenu.Content>
									<DropdownMenu.Item onclick={() => begin_symbol_edit(symbol)}>
										<Code class="h-4 w-4" />
										<span>Edit</span>
									</DropdownMenu.Item>
									<DropdownMenu.Item onclick={() => begin_symbol_move(symbol)}>
										<ArrowLeftRight class="h-4 w-4" />
										<span>Move</span>
									</DropdownMenu.Item>
									<DropdownMenu.Item onclick={() => begin_symbol_rename(symbol)}>
										<SquarePen class="h-4 w-4" />
										<span>Rename</span>
									</DropdownMenu.Item>
									<DropdownMenu.Item onclick={() => begin_symbol_delete(symbol)} class="text-red-500 hover:text-red-600 focus:text-red-600">
										<Trash2 class="h-4 w-4" />
										<span>Delete</span>
									</DropdownMenu.Item>
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						</SymbolButton>
					</li>
				{/each}
			</ul>
		</div>
	{:else}
		<EmptyState icon={Cuboid} title="No Blocks to display" description="Blocks are components you can add to any site. When you create one it'll show up here." />
	{/if}
</div>

<!-- Symbol Dialogs -->
<Dialog.Root bind:open={is_symbol_move_open}>
	<Dialog.Content class="sm:max-w-[425px] pt-12 gap-0">
		<div class="grid gap-4">
			<div class="space-y-2">
				<h4 class="font-medium leading-none">Move to group</h4>
				<p class="text-muted-foreground text-sm">Select a group for this block</p>
			</div>
			<RadioGroup.Root bind:value={selected_group_id}>
				{#each symbol_groups ?? [] as group}
					<div class="flex items-center space-x-2">
						<RadioGroup.Item value={group.name} id={group.name} />
						<Label for={group.name}>{group.name}</Label>
					</div>
				{/each}
			</RadioGroup.Root>
			<div class="flex justify-end">
				<Button onclick={move_symbol}>Move</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={creating_block}>
	<Dialog.Content escapeKeydownBehavior="ignore" class="max-w-[1600px] h-full max-h-[100vh] flex flex-col p-4 gap-0">
		<CreateBlock bind:symbol={new_symbol} head={generated_head_code} onsubmit={create_symbol} />
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={is_symbol_editor_open}>
	<Dialog.Content escapeKeydownBehavior="ignore" class="max-w-[1600px] h-full max-h-[100vh] flex flex-col p-4 gap-0">
		<CreateBlock symbol={symbol_being_edited} head={generated_head_code} onsubmit={save_symbol} />
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={is_symbol_renamer_open}>
	<Dialog.Content class="sm:max-w-[425px] pt-12 gap-0">
		<h2 class="text-lg font-semibold leading-none tracking-tight">Rename Block</h2>
		<p class="text-muted-foreground text-sm">Enter a new name for your Block</p>
		<form onsubmit={handle_symbol_rename}>
			<Input bind:value={new_name} placeholder="Enter new Block name" class="my-4" />
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (is_symbol_renamer_open = false)}>Cancel</Button>
				<Button type="submit">Rename</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<AlertDialog.Root bind:open={is_delete_symbol_open}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you sure?</AlertDialog.Title>
			<AlertDialog.Description>
				This action cannot be undone. This will permanently delete <strong>{symbol_being_deleted?.name}</strong>
				and remove all associated data.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={delete_library_symbol} class="bg-red-600 hover:bg-red-700">
				{#if deleting}
					<div class="animate-spin absolute">
						<Loader />
					</div>
				{:else}
					Delete {symbol_being_deleted?.name}
				{/if}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<style lang="postcss">
	.masonry {
		display: grid;
		gap: 1rem;
		/* grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); */
		grid-template-columns: 1fr 1fr;

		@media (min-width: 700px) {
			grid-template-columns: 1fr 1fr 1fr;
		}
	}

	ul {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
