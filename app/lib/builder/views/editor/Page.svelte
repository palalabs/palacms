<script lang="ts">
	import * as _ from 'lodash-es'
	import { tick } from 'svelte'
	import { flip } from 'svelte/animate'
	import UI from '$lib/builder/ui'
	import * as Dialog from '$lib/components/ui/dialog'
	import SectionEditor from '$lib/builder/views/modal/SectionEditor/SectionEditor.svelte'
	import ComponentNode from './Layout/ComponentNode.svelte'
	import BlockToolbar from './Layout/BlockToolbar.svelte'
	import LockedOverlay from './Layout/LockedOverlay.svelte'
	import DropIndicator from './Layout/DropIndicator.svelte'
	import { locale, locked_blocks, page_loaded, dragging_symbol } from '$lib/builder/stores/app/misc'
	import { dropTargetForElements } from '$lib/builder/libraries/pragmatic-drag-and-drop/entry-point/element/adapter.js'
	import { attachClosestEdge, extractClosestEdge } from '$lib/builder/libraries/pragmatic-drag-and-drop-hitbox/closest-edge.js'
	import { beforeNavigate } from '$app/navigation'
	import { Pages, Sites, SiteSymbols, PageSections } from '$lib/pocketbase/collections'
	import type { ObjectOf } from '$lib/pocketbase/CollectionMapping.svelte'

	let { page }: { page: ObjectOf<typeof Pages> } = $props()

	const site = $derived(Sites.one(page.site))
	const sections = $derived(page.sections())
	$inspect({ sections })

	// Fade in page when all components mounted
	let page_mounted = $state(false)

	// detect when all sections are mounted to fade in page
	let sections_mounted = $state(0)

	beforeNavigate(() => {
		page_mounted = false
		sections_mounted = 0
	})

	async function lock_block(block_id) {
		// TODO: Implement
	}

	function unlock_block() {
		// TODO: Implement
	}

	async function repair_section_indices() {
		console.log('Repairing section indices...')
		// Just use the current order of sections and assign consecutive indices
		for (let i = 0; i < sections.length; i++) {
			if (sections[i].index !== i) {
				console.log(`Updating section ${sections[i].id} index from ${sections[i].index} to ${i}`)
				await PageSections.update(sections[i].id, { index: i })
			}
		}
	}

	async function add_section_to_page({ symbol, position }) {
		console.log('add_section_to_page called', { position, sections_count: sections.length, palette_sections_count: palette_sections.length })
		
		// Check if indices need repair
		const has_incorrect_indices = sections.some((section, i) => section.index !== i)
		if (has_incorrect_indices) {
			await repair_section_indices()
		}
		
		// Adjust indices of existing sections that come after the insertion position
		console.log('All sections before filtering:', sections.map(s => ({ id: s.id, index: s.index })))
		const existing_sections = sections.filter((section) => section.index >= position)
		console.log('Sections to update:', existing_sections.map(s => ({ id: s.id, current_index: s.index, new_index: s.index + 1 })))
		
		for (const section of existing_sections) {
			await PageSections.update(section.id, { index: section.index + 1 })
		}

		// Create new section
		const new_section = await PageSections.create({
			page: page.id,
			symbol: symbol.id,
			index: position
		})

		console.log('Created new section', { id: new_section.id, position })
		return new_section.id
	}

	async function remove_section_from_page(section_id) {
		console.log({ section_id })
		const section_to_delete = sections.find((s) => s.id === section_id)
		if (!section_to_delete) return

		// Adjust indices of remaining sections that come after the deleted section
		const sections_to_update = sections.filter((section) => section.index > section_to_delete.index)
		console.log({ sections, section_to_delete, sections_to_update })
		for (const section of sections_to_update) {
			console.log(section.id, { index: section.index, newindex: section.index - 1 })
			await PageSections.update(section.id, { index: section.index - 1 })
		}

		// Delete the section
		await PageSections.delete(section_id)
	}

	let page_el = $state()
	let hovered_block_el = $state()

	////////////////////////////
	// BLOCK TOOLBAR ///////////
	////////////////////////////

	let block_toolbar_element = $state()
	let showing_block_toolbar = $state(false)

	// Add this state variable to track if we're hovering over the toolbar
	let hovering_toolbar = $state(false)

	async function show_block_toolbar() {
		console.log('show_block_toolbar called', { showing_block_toolbar, hovered_section_id, hovered_block_el: !!hovered_block_el })
		// Clear any pending hide timeout
		if (hide_toolbar_timeout) {
			clearTimeout(hide_toolbar_timeout)
			hide_toolbar_timeout = null
		}
		
		if (!showing_block_toolbar) {
			showing_block_toolbar = true
			await tick()
			position_block_toolbar()
			page_el.addEventListener('scroll', position_block_toolbar)
		} else {
			// Already showing, just reposition
			position_block_toolbar()
		}
	}

	async function position_block_toolbar() {
		if (!hovered_block_el || !block_toolbar_element) return

		const { top, left, bottom, right } = hovered_block_el.getBoundingClientRect()
		const toolbar_height = 44

		// Keep toolbar within viewport bounds
		const toolbar_top = Math.max(toolbar_height, Math.min(top, window.innerHeight - toolbar_height))
		const toolbar_bottom = Math.max(0, window.innerHeight - bottom)

		block_toolbar_element.style.position = 'fixed'
		block_toolbar_element.style.top = `${toolbar_top}px`
		block_toolbar_element.style.bottom = `${toolbar_bottom}px`
		block_toolbar_element.style.left = `${left}px`
		block_toolbar_element.style.right = `${window.innerWidth - right}px`
	}

	let hide_toolbar_timeout = null
	
	async function hide_block_toolbar() {
		console.log('hide_block_toolbar called', { hovering_toolbar })
		// Clear any existing timeout
		if (hide_toolbar_timeout) {
			clearTimeout(hide_toolbar_timeout)
		}
		// Add a small delay to prevent hiding when quickly moving between sections
		hide_toolbar_timeout = setTimeout(() => {
			if (!hovering_toolbar) {
				showing_block_toolbar = false
				page_el.removeEventListener('scroll', position_block_toolbar)
			}
		}, 100)
	}

	////////////////////////////
	// DROP INDICATOR //////////
	////////////////////////////

	let drop_indicator_element = $state()
	let showing_drop_indicator = $state(false)

	async function show_drop_indicator() {
		if (!showing_drop_indicator) {
			showing_drop_indicator = true
			await tick()
			// Reset display style when showing
			if (drop_indicator_element) {
				drop_indicator_element.style.display = ''
			}
			page_el.addEventListener('scroll', position_drop_indicator)
		}
	}

	async function position_drop_indicator() {
		if (!hovered_block_el || !drop_indicator_element) return
		
		const { top, left, bottom, right } = hovered_block_el.getBoundingClientRect()
		
		// Position the line at the appropriate edge
		drop_indicator_element.style.left = `${left}px`
		drop_indicator_element.style.width = `${right - left}px`
		
		if (dragging.position === 'top') {
			// Show line at the top edge of the section
			drop_indicator_element.style.top = `${top - 2}px`
			drop_indicator_element.style.bottom = 'initial'
		} else if (dragging.position === 'bottom') {
			// Show line at the bottom edge of the section  
			drop_indicator_element.style.top = `${bottom - 2}px`
			drop_indicator_element.style.bottom = 'initial'
		}
	}

	function hide_drop_indicator() {
		console.log('hide_drop_indicator called', { showing_drop_indicator, drop_indicator_element: !!drop_indicator_element })
		showing_drop_indicator = false
		if (page_el) {
			page_el.removeEventListener('scroll', position_drop_indicator)
		}
		// Force hide the element immediately
		if (drop_indicator_element) {
			drop_indicator_element.style.display = 'none'
		}
	}

	////////////////////////////

	let editing_section_tab = $state('code')
	function edit_section(tab) {
		if (!hovered_section) return
		lock_block(hovered_section_id)
		const section = sections.find((s) => s.id === hovered_section_id) // get updated block (necessary if actively editing on-page)
		editing_section = true
		editing_section_tab = tab
	}

	let moving = $state(false) // workaround to prevent block toolbar from showing when moving blocks

	let dragging = {
		id: null,
		position: null
	}
	function reset_drag() {
		// Clear any pending drag leave timeout
		if (drag_leave_timeout) {
			clearTimeout(drag_leave_timeout)
			drag_leave_timeout = null
		}

		dragging = {
			id: null,
			position: null
		}
		dragging_over_section = false
		hide_drop_indicator()
	}

	let dragging_over_section = $state(false)
	let drag_leave_timeout = null

	function drag_fallback(element) {
		dropTargetForElements({
			element,
			getData({ input, element }) {
				return attachClosestEdge(
					{},
					{
						element,
						input,
						allowedEdges: ['top', 'bottom']
					}
				)
			},
			async onDrag({ self, source }) {
				// Clear any pending drag leave timeout since we're still dragging
				if (drag_leave_timeout) {
					clearTimeout(drag_leave_timeout)
					drag_leave_timeout = null
				}

				if (dragging_over_section) return // prevent double-adding block
				const last_section_id = palette_sections[palette_sections.length - 1]?.id
				if (!last_section_id) return
				hovered_block_el = page_el.querySelector(`[data-section="${last_section_id}"]`)

				if (!showing_drop_indicator) {
					await show_drop_indicator()
				}
				position_drop_indicator()
				if (dragging.id !== last_section_id || dragging.position !== extractClosestEdge(self.data)) {
					dragging = {
						id: last_section_id,
						position: extractClosestEdge(self.data)
					}
				}
			},
			onDragLeave({ source }) {
				console.log('Fallback onDragLeave')
				// Use a timeout to avoid hiding the indicator when briefly leaving the area
				// but still dragging over a valid drop target
				drag_leave_timeout = setTimeout(() => {
					reset_drag()
				}, 100)
			},
			async onDrop({ source }) {
				console.log('Fallback onDrop', { dragging_over_section })
				// Immediately hide drop indicator
				hide_drop_indicator()
				
				// Clear any pending drag leave timeout
				if (drag_leave_timeout) {
					clearTimeout(drag_leave_timeout)
					drag_leave_timeout = null
				}

				if (dragging_over_section) {
					console.log('Fallback onDrop early return due to dragging_over_section')
					return // prevent double-adding block
				}
				const block_being_dragged = source.data.block
				const new_section_id = await add_section_to_page({
					symbol: block_being_dragged,
					position: sections.length
				})
				// const new_section_el = page_el.querySelector(`[data-section="${new_section_id}"]`)
				// new_section_el.scrollIntoView({
				// 	behavior: 'smooth',
				// 	block: 'center',
				// 	inline: 'center'
				// })
				reset_drag()
			}
		})
	}

	function drag_item(element, section) {
		dropTargetForElements({
			element,
			getData({ input, element }) {
				return attachClosestEdge(
					{ section },
					{
						element,
						input,
						allowedEdges: ['top', 'bottom']
					}
				)
			},
			async onDrag({ self, source }) {
				// Clear any pending drag leave timeout since we're still dragging
				if (drag_leave_timeout) {
					clearTimeout(drag_leave_timeout)
					drag_leave_timeout = null
				}

				hovered_block_el = self.element
				if (!showing_drop_indicator) {
					await show_drop_indicator()
				}
				position_drop_indicator()
				if (dragging.id !== self.data.section.id || dragging.position !== extractClosestEdge(self.data)) {
					dragging = {
						id: self.data.section.id,
						position: extractClosestEdge(self.data)
					}
				}
			},
			onDragEnter() {
				console.log('Section onDragEnter')
				// Clear any pending drag leave timeout since we're entering a valid drop target
				if (drag_leave_timeout) {
					clearTimeout(drag_leave_timeout)
					drag_leave_timeout = null
				}
				dragging_over_section = true
			},
			onDragLeave() {
				console.log('drag_item onDragLeave')
				dragging_over_section = false
				// Use a timeout to avoid hiding the indicator when briefly leaving the area
				// but still dragging over a valid drop target
				drag_leave_timeout = setTimeout(() => {
					reset_drag()
				}, 100)
			},
			async onDrop({ self, source }) {
				console.log('drag_item onDrop called', { section_id: self.data.section.id, dragging_over_section })
				// Immediately hide drop indicator
				hide_drop_indicator()
				
				// Clear any pending drag leave timeout
				if (drag_leave_timeout) {
					clearTimeout(drag_leave_timeout)
					drag_leave_timeout = null
				}

				const section_dragged_over_index = sections.find((s) => s.id === self.data.section.id).index
				const block_being_dragged = source.data.block
				const closestEdgeOfTarget = extractClosestEdge(self.data)
				console.log('drag_item onDrop details', { section_dragged_over_index, closestEdgeOfTarget })
				
				if (closestEdgeOfTarget === 'top') {
					console.log('Inserting BEFORE section at index', section_dragged_over_index)
					const new_section_id = await add_section_to_page({
						symbol: block_being_dragged,
						position: section_dragged_over_index
					})
					// const new_section_el = page_el.querySelector(`[data-section="${new_section_id}"]`)
					// new_section_el.scrollIntoView({
					// 	behavior: 'smooth',
					// 	block: 'center',
					// 	inline: 'center'
					// })
				} else if (closestEdgeOfTarget === 'bottom') {
					console.log('Inserting AFTER section at index', section_dragged_over_index)
					const new_section_id = await add_section_to_page({
						symbol: block_being_dragged,
						position: section_dragged_over_index + 1
					})
					// const new_section_el = page_el.querySelector(`[data-section="${new_section_id}"]`)
					// new_section_el.scrollIntoView({
					// 	behavior: 'smooth',
					// 	block: 'center',
					// 	inline: 'center'
					// })
				}
				reset_drag()
				$dragging_symbol = false
			}
		})
	}

	let page_is_empty = $derived(sections.length === 0)
	$effect(() => {
		if (sections_mounted === sections.length && sections_mounted !== 0) {
			page_mounted = true
		} else if (page_is_empty) {
			page_mounted = true
		}
	})
	let block_toolbar_on_locked_block = $derived($locked_blocks.find((b) => b.block_id === hovered_section?.id))
	$effect(() => {
		if (block_toolbar_on_locked_block) hide_block_toolbar()
	})

	let palette_sections = $derived(sections.filter((s) => s.palette))

	let hovered_section_id: string | null = $state(null)
	let hovered_section = $derived(page?.sections().find((s) => s.id === hovered_section_id))
	let editing_section = $state(false)
</script>

<Dialog.Root bind:open={editing_section}>
	<Dialog.Content class="z-[999] max-w-[1600px] h-full max-h-[100vh] flex flex-col p-4">
		<SectionEditor
			component={hovered_section}
			tab={editing_section_tab}
			header={{
				button: {
					label: 'Save',
					onclick: (updated_data) => {
						// TODO
						// Object.assign(hovered_section, updated_data)
						hovering_toolbar = false
						editing_section = false
					}
				}
			}}
		/>
	</Dialog.Content>
</Dialog.Root>

<!-- Loading Spinner -->
{#if !page_mounted && sections.length > 1}
	<div class="spinner" style="--Spinner-color: var(--color-gray-7);">
		<UI.Spinner variant="loop" />
	</div>
{/if}

<!-- Drop Indicator -->
{#if showing_drop_indicator}
	<DropIndicator bind:node={drop_indicator_element} />
{/if}

<!-- Block Buttons -->
{#if showing_block_toolbar && !block_toolbar_on_locked_block}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="absolute z-50"
		onmouseenter={() => {
			hovering_toolbar = true
		}}
		onmouseleave={() => {
			hovering_toolbar = false
			setTimeout(() => {
				if (!hovering_toolbar) {
					showing_block_toolbar = false
				}
			}, 50)
		}}
	>
		<BlockToolbar
			bind:node={block_toolbar_element}
			id={hovered_section_id}
			on:delete={async () => {
				// Get the section ID before clearing state
				const section_id_to_delete = hovered_section_id
				// Force hide the toolbar immediately
				showing_block_toolbar = false
				hovered_section_id = null
				hovered_block_el = null
				page_el.removeEventListener('scroll', position_block_toolbar)
				await remove_section_from_page(section_id_to_delete)
			}}
			on:edit-code={() => edit_section('code')}
			on:edit-content={() => edit_section('content')}
			on:moveUp={async () => {
				moving = true
				hide_block_toolbar()
				// await move_section(hovered_section, hovered_section.index - 1)
				setTimeout(() => {
					moving = false
				}, 300)
			}}
			on:moveDown={async () => {
				moving = true
				hide_block_toolbar()
				// await move_section(hovered_section, hovered_section.index + 1)
				setTimeout(() => {
					moving = false
				}, 300)
			}}
		/>
	</div>
{/if}

<!-- Page Blocks -->
<main id="Page" bind:this={page_el} class:fadein={true} class:dragging={$dragging_symbol} lang={$locale} use:drag_fallback>
	{#each sections as section (section.id)}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_mouse_events_have_key_events -->
		{@const block = SiteSymbols.one(section.symbol)}
		{@const locked = $locked_blocks.find((b) => b.block_id === section.id)}
		{@const in_current_tab = false}
		{@const show_block_toolbar_on_hover = page_mounted && !moving}
		<div
			role="presentation"
			data-section={section.id}
			data-symbol={block?.id}
			onmousemove={(e) => {
				if (show_block_toolbar_on_hover && hovered_section_id === section.id) {
					show_block_toolbar()
				}
			}}
			onmouseenter={async (e) => {
				console.log('Section mouseenter', section.id, { show_block_toolbar_on_hover, page_loaded: $page_loaded, page_mounted, moving })
				hovered_section_id = section.id
				hovered_block_el = e.currentTarget
				if (show_block_toolbar_on_hover) {
					show_block_toolbar()
				} else {
					console.log('Not showing toolbar due to conditions')
				}
			}}
			onmouseleave={(e) => {
				console.log('Section mouseleave', section.id)
				hide_block_toolbar()
			}}
			animate:flip={{ duration: 100 }}
			use:drag_item={section}
		>
			{#if locked && !in_current_tab}
				<LockedOverlay {locked} />
			{/if}
			<ComponentNode
				{block}
				{section}
				on:lock={() => lock_block(section.id)}
				on:unlock={() => unlock_block()}
				on:mount={() => sections_mounted++}
				on:resize={() => {
					if (showing_block_toolbar) {
						position_block_toolbar()
					}
				}}
			/>
		</div>
	{/each}

	{#if sections.length === 0}
		<div
			class="empty-state"
			style="height: 100%"
			onmouseenter={({ target }) => {
				hovered_block_el = target
			}}
			onmouseleave={() => {
				hovered_block_el = null
			}}
		>
			<span>Drag blocks here to add them to the page</span>
		</div>
	{/if}
</main>

<style lang="postcss">
	[data-section] {
		overflow: hidden;
		position: relative;
		min-height: 3rem;
		line-height: 0;
	}
	[data-type='palette'] {
		.empty-state {
			background: var(--color-gray-1);
			display: flex;
			justify-content: center;
			padding-block: 5rem;
			border: 1px dotted;
			&.page_is_empty {
				height: 100%;
			}
		}
	}
	.spinner {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		/* height: 100vh; */
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 5;
		--Spinner-font-size: 3rem;
		--Spinner-color: var(--weave-primary-color);
		--Spinner-color-opaque: rgba(248, 68, 73, 0.2);
	}
	main#Page {
		transition: 0.2s opacity;
		opacity: 0;
		border-top: 0;
		height: 100%;
		/* padding-top: 42px; */
		overflow: auto;
		box-sizing: border-box;
	}
	main.dragging :global(iframe) {
		pointer-events: none !important;
	}
	main#Page.fadein {
		opacity: 1;
	}
	.empty-state {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		color: var(--color-gray-4);
		z-index: -2;
		font-family: Inter, sans-serif;
		color: var(--color-gray-7);
		z-index: 1;
		text-align: center;
	}
	.button {
		background: var(--color-gray-1);
		padding: 0.5rem 1rem;
		border-radius: var(--primo-border-radius);
		font-size: 0.875rem;
		text-decoration: none;
		color: var(--color-gray-7);
	}
</style>
