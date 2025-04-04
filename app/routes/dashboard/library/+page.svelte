<script lang="ts">
	import CreateBlock from '$lib/components/Modals/CreateBlock.svelte'
	import * as Sidebar from '$lib/components/ui/sidebar'
	import * as Dialog from '$lib/components/ui/dialog'
	import CodeEditor from '$lib/builder/components/CodeEditor/CodeMirror.svelte'
	import DesignFields from '$lib/components/Modals/DesignFields.svelte'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import * as AlertDialog from '$lib/components/ui/alert-dialog'
	import { Input } from '$lib/components/ui/input'
	import * as code_generators from '$lib/builder/code_generators'
	import { processCode } from '$lib/builder/utils.js'
	import { Separator } from '$lib/components/ui/separator'
	import { Button } from '$lib/components/ui/button'
	import EmptyState from '$lib/components/EmptyState.svelte'
	import { CirclePlus, Cuboid, Palette, Code, Upload, SquarePen, Trash2, ChevronDown, Loader } from 'lucide-svelte'
	import LibrarySymbolButton from '$lib/components/LibrarySymbolButton.svelte'
	import { page } from '$app/state'
	import { goto } from '$app/navigation'
	import { useSidebar } from '$lib/components/ui/sidebar'
	import { require_library } from '$lib/loaders'
	import type { Id } from '$lib/common/models/Id'
	import { ID } from '$lib/common'

	const library = require_library()
	const active_symbol_group_id = $derived(page.url.searchParams.get('group') as Id)
	const active_symbol_group = $derived(active_symbol_group_id && $library?.data.entities.symbol_groups[active_symbol_group_id])

	const sidebar = useSidebar()

	let editing_head = $state(false)
	let editing_design = $state(false)
	let creating_block = $state(false)

	async function upload_block_file(event) {
		const file = event.target.files[0]
		if (!file) return
		// TODO: Implement
		throw new Error('Not implemented')
	}

	let design_variables_css = $state($library && code_generators.site_design_css($library.data.design))
	function update_design_value(token, value) {
		if (!$library) return
		$library.data.design[token] = value
		design_variables_css = code_generators.site_design_css($library.data.design)
	}

	let generated_head_code = $state('')

	// Generate <head> tag code
	$effect.pre(() => {
		compile_component_head(`<svelte:head>${$library?.data.head}</svelte:head>`).then((generated) => {
			generated_head_code = generated
		})
	})

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
		editing_design = false
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
		if (!active_symbol_group) return
		active_symbol_group.name = new_name
		require_library.refresh()
		is_rename_open = false
	}

	let is_delete_open = $state(false)
	let deleting = $state(false)
	async function handle_delete() {
		deleting = true
		await goto('/dashboard/library/starters')
		if (!active_symbol_group) return
		delete $library?.data.entities.symbol_groups[active_symbol_group_id]
		require_library.refresh()
		deleting = false
	}
</script>

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
	<!-- !data.user.collaborator -->
	{#if $library}
		<div class="ml-auto mr-4 flex gap-2">
			<Button size="sm" variant="ghost" onclick={() => (editing_head = true)} aria-label="Design">
				<Code class="h-4 w-4" />
			</Button>
			<Dialog.Root bind:open={editing_head}>
				<Dialog.Content class="max-w-[900px] h-full max-h-[80vh] flex flex-col p-4 gap-4">
					<Dialog.Header
						title=""
						button={{
							label: 'Save',
							onclick: save_settings
						}}
					/>
					<div class="space-y-2">
						<h4 class="font-medium leading-none">Head Code</h4>
						<p class="text-muted-foreground text-sm">
							Add code that will be included in the head section when displaying blocks in this library (CSS resets, shared styles, meta tags, etc). When blocks are used in sites, they'll use the head
							code from those sites instead.
						</p>
					</div>
					<CodeEditor mode="html" bind:value={$library.data.head} on:save={() => {}} />
				</Dialog.Content>
			</Dialog.Root>
			<Button class="mr-2" size="sm" variant="ghost" onclick={() => (editing_design = true)} aria-label="Design">
				<Palette class="h-4 w-4" />
			</Button>
			<Dialog.Root bind:open={editing_design}>
				<Dialog.Content class="max-w-[600px] h-full max-h-[90vh] flex flex-col p-4 gap-0">
					<Dialog.Header
						title="Design"
						button={{
							label: 'Save',
							onclick: save_settings
						}}
					/>
					<div
						class="overflow-auto"
						style:--label-font-size="0.875rem"
						style:--label-font-weight="400"
						style:--DesignPanel-brand-color={$library?.data.design['primary_color']}
						style:--DesignPanel-font-heading={$library?.data.design['heading_font']}
						style:--DesignPanel-border-radius={$library?.data.design['radius']}
					>
						<DesignFields values={$library?.data.design} oninput={(token, val) => update_design_value(token, val)} />
					</div>
				</Dialog.Content>
			</Dialog.Root>
			<Button variant="outline" size="sm">
				<label class="flex items-center gap-2 cursor-pointer">
					<input onchange={upload_block_file} type="file" class="sr-only" />
					<Upload class="h-4 w-4" />
					Upload
				</label>
			</Button>
			<Button size="sm" variant="outline" onclick={() => (creating_block = true)}>
				<CirclePlus class="h-4 w-4" />
				Create Block
			</Button>
			<Dialog.Root bind:open={creating_block}>
				<Dialog.Content class="max-w-[1600px] h-full max-h-[100vh] flex flex-col p-4 gap-0">
					<CreateBlock />
				</Dialog.Content>
			</Dialog.Root>
		</div>
	{/if}
</header>

<div class="flex flex-1 flex-col gap-4 px-4 pb-4">
	{#if active_symbol_group?.symbols.length}
		<div class="masonry">
			<ul>
				{#each active_symbol_group.symbols.slice((active_symbol_group.symbols.length / 3) * 2, (active_symbol_group.symbols.length / 3) * 3) as symbol (symbol[ID])}
					<li>
						<LibrarySymbolButton {symbol} head={generated_head_code + design_variables_css} />
					</li>
				{/each}
			</ul>
			<ul>
				{#each active_symbol_group.symbols.slice(active_symbol_group.symbols.length / 3, (active_symbol_group.symbols.length / 3) * 2) as symbol (symbol[ID])}
					<li>
						<LibrarySymbolButton {symbol} head={generated_head_code + design_variables_css} />
					</li>
				{/each}
			</ul>
			<ul>
				{#each active_symbol_group.symbols.slice(0, active_symbol_group.symbols.length / 3) as symbol (symbol[ID])}
					<li>
						<LibrarySymbolButton {symbol} head={generated_head_code + design_variables_css} />
					</li>
				{/each}
			</ul>
		</div>
	{:else}
		<EmptyState icon={Cuboid} title="No Blocks to display" description="Blocks are components you can add to any site. When you create one it'll show up here." />
	{/if}
</div>

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
