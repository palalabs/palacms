<script lang="ts">
	import ModalHeader from '../../views/modal/ModalHeader.svelte'
	import * as Sidebar from '$lib/components/ui/sidebar'
	import Symbol from '../../components/Site_Symbol.svelte'
	import { site_html } from '$lib/builder/stores/app/page'
	import type { Resolved } from '$lib/pocketbase/Resolved'
	import type { Symbol as SymbolModel } from '$lib/common/models/Symbol'
	import { Id } from '$lib/common/models/Id'
	import { ID } from '$lib/common/constants'
	import { require_library, require_site } from '$lib/loaders'
	import type { SymbolGroup } from '$lib/common/models/Library'

	let { site, onsave } = $props()

	const library = require_library()
	let selected_symbol_group = $state<Resolved<typeof SymbolGroup> | null>(null)
	let columns = $derived(
		selected_symbol_group
			? [
					selected_symbol_group.symbols.slice((selected_symbol_group.symbols.length / 3) * 2, (selected_symbol_group.symbols.length / 3) * 3),
					selected_symbol_group.symbols.slice(selected_symbol_group.symbols.length / 3, (selected_symbol_group.symbols.length / 3) * 2),
					selected_symbol_group.symbols.slice(0, selected_symbol_group.symbols.length / 3)
				]
			: []
	)

	let selected: Resolved<typeof SymbolModel>[] = $state([])
	let checked: Id[] = $state([])

	function include_symbol(symbol: Resolved<typeof SymbolModel>) {
		if (selected.some((s) => s[ID] === symbol[ID]) || checked.includes(symbol[ID])) {
			selected = selected.filter((item) => item[ID] !== symbol[ID])
			checked = checked.filter((item) => item !== symbol[ID])
		} else {
			selected = [...selected, symbol]
			checked = [...checked, symbol[ID]]
		}
	}
</script>

<ModalHeader
	icon="lucide:blocks"
	title="Add Library Blocks to Site"
	button={{
		label: `Add ${selected.length} Blocks`,
		onclick: () => onsave(selected),
		icon: 'lucide:blocks',
		disabled: selected.length === 0
	}}
/>

<Sidebar.Provider>
	<Sidebar.Root collapsible="none">
		<Sidebar.Content class="p-2">
			<Sidebar.Menu>
				{#each $library?.data.symbol_groups ?? [] as group}
					<Sidebar.MenuItem>
						<Sidebar.MenuButton isActive={selected_symbol_group?.[ID] === group[ID]}>
							{#snippet child({ props })}
								<button {...props} onclick={() => (selected_symbol_group = group)}>{group.name}</button>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				{/each}
			</Sidebar.Menu>
		</Sidebar.Content>
	</Sidebar.Root>
	<Sidebar.Inset>
		<div class="BlockPicker">
			<ul>
				{#each columns[0] as symbol (symbol[ID])}
					<li>
						<Symbol checked={checked.includes(symbol[ID])} onclick={() => include_symbol(symbol)} {symbol} />
					</li>
				{/each}
			</ul>
			<ul>
				{#each columns[1] as symbol (symbol[ID])}
					<li>
						<Symbol checked={checked.includes(symbol[ID])} onclick={() => include_symbol(symbol)} {symbol} />
					</li>
				{/each}
			</ul>
			<ul>
				{#each columns[2] as symbol (symbol[ID])}
					<li>
						<Symbol checked={checked.includes(symbol[ID])} onclick={() => include_symbol(symbol)} {symbol} />
					</li>
				{/each}
			</ul>
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>

<style lang="postcss">
	.BlockPicker {
		background: #111;
		padding: 1rem;
		height: calc(100vh - 70px);
		overflow: auto;
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 0.5rem;
	}
</style>
