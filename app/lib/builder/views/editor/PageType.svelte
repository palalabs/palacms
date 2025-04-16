<script lang="ts">
	import * as _ from 'lodash-es'
	import { tick } from 'svelte'
	import { fade } from 'svelte/transition'
	import { flip } from 'svelte/animate'
	import UI from '../../ui/index.js'
	import ComponentNode from './Layout/ComponentNode.svelte'
	import BlockToolbar from './Layout/BlockToolbar.svelte'
	import DropIndicator from './Layout/DropIndicator.svelte'
	import SymbolPalette from './Layout/SymbolPalette.svelte'
	import LockedOverlay from './Layout/LockedOverlay.svelte'
	import { locale } from '../../stores/app/misc.js'
	import modal from '../../stores/app/modal.js'
	import { dropTargetForElements } from '../../libraries/pragmatic-drag-and-drop/entry-point/element/adapter.js'
	import { attachClosestEdge, extractClosestEdge } from '../../libraries/pragmatic-drag-and-drop-hitbox/closest-edge.js'
	import { require_site } from '$lib/loaders/index.js'
	import { page } from '$app/state'
	import { ID } from '$lib/common/constants'
	import type { Id } from '$lib/common/models/Id.js'
	import type { Resolved } from '$lib/common/index.js'
	import type { Section } from '$lib/common/models/Section.js'

	const site_id = $derived(page.params.site as Id)
	const page_type_id = $derived(page.params.page_type as Id)
	const site = $derived(require_site(site_id))
	const page_type = $derived($site?.data.entities.page_types[page_type_id] ?? null)

	// Fade in page when all components mounted
	let page_mounted = $state(true)

	// detect when all sections are mounted
	let sections_mounted = $state(0)

	async function lock_block(block_id) {
		// TODO
	}

	function unlock_block() {
		// TODO
	}

	let hovered_section_id: Resolved<typeof Section> | null = $state(null)

	let block_toolbar_element = $state()
	let page_el = $state()
	let hovered_block_el = $state()

	let showing_block_toolbar = $state(false)
	async function show_block_toolbar() {
		showing_block_toolbar = true
		await tick()
		position_block_toolbar()
		page_el.addEventListener('scroll', () => {
			showing_block_toolbar = false
		})
	}

	function position_block_toolbar() {
		if (!hovered_block_el) return
		hovered_block_el.appendChild(block_toolbar_element)
		const { top, left, bottom, right } = hovered_block_el.getBoundingClientRect()
		const block_positions = {
			top: (top <= 43 ? 43 : top) + window.scrollY,
			bottom: bottom >= window.innerHeight ? 0 : window.innerHeight - bottom,
			left,
			right: window.innerWidth - right - window.scrollX
		}
		block_toolbar_element.style.top = `${block_positions.top}px`
		block_toolbar_element.style.bottom = `${block_positions.bottom}px`
		block_toolbar_element.style.left = `${block_positions.left}px`
		block_toolbar_element.style.right = `${block_positions.right}px`
	}

	function hide_block_toolbar() {
		showing_block_toolbar = false
	}

	function edit_component(section_id, showIDE = false) {
		const section = page_type?.sections.find((s) => s[ID] === section_id)
		if (!section) return
		lock_block(section_id)
		modal.show(
			'SECTION_EDITOR',
			{
				component: section,
				tab: showIDE ? 'code' : 'content',
				header: {
					title: `Edit Block`,
					icon: showIDE ? 'fas fa-code' : 'fas fa-edit',
					onclose: () => {
						unlock_block()
					},
					button: {
						icon: 'fas fa-check',
						label: 'Save',
						onclick: (updated_data) => {
							Object.assign(section, updated_data)
							modal.hide()
						}
					}
				}
			},
			{
				showSwitch: true,
				disabledBgClose: true
			}
		)
	}

	let moving = $state(false) // workaround to prevent block toolbar from showing when moving blocks

	// using instead of <svelte:head> to enable script tags
	function append_to_head(code) {
		const temp_container = document.createElement('div')
		temp_container.innerHTML = code

		const elements = Array.from(temp_container.childNodes)
		const scripts = []

		elements.forEach((child) => {
			if (child.tagName === 'SCRIPT') {
				scripts.push(child)
			} else {
				document.head.appendChild(child)
			}
		})

		function load_script(script_element) {
			return new Promise((resolve) => {
				const new_script = document.createElement('script')
				Array.from(script_element.attributes).forEach((attr) => {
					new_script.setAttribute(attr.name, attr.value)
				})

				if (script_element.src) {
					new_script.onload = resolve
					new_script.onerror = resolve // Proceed even if a script fails to load
				} else {
					new_script.textContent = script_element.textContent
				}

				document.head.appendChild(new_script)

				if (!script_element.src) {
					resolve()
				}
			})
		}

		scripts.reduce((promise, script_element) => {
			return promise.then(() => load_script(script_element))
		}, Promise.resolve())
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
			page_el.addEventListener('scroll', position_drop_indicator)
		}
	}

	function position_drop_indicator() {
		if (!hovered_block_el) return // hovering over page (i.e. below sections)
		hovered_block_el.appendChild(drop_indicator_element)
		const { top, left, bottom, right } = hovered_block_el.getBoundingClientRect()
		const block_positions = {
			top: (top <= 56 ? 56 : top) + window.scrollY,
			bottom: bottom >= window.innerHeight ? 0 : window.innerHeight - bottom,
			left,
			right: window.innerWidth - right - window.scrollX
		}
		drop_indicator_element.style.left = `${block_positions.left}px`
		drop_indicator_element.style.right = `${block_positions.right}px`

		// surround placeholder palette
		if (dragging.position === 'top' || !page_type?.sections.length) {
			drop_indicator_element.style.top = `${block_positions.top}px`
		} else {
			drop_indicator_element.style.top = `initial`
		}

		if (dragging.position === 'bottom' || !page_type?.sections.length) {
			drop_indicator_element.style.bottom = `${block_positions.bottom}px`
		} else {
			drop_indicator_element.style.bottom = `initial`
		}
	}

	function hide_drop_indicator() {
		showing_drop_indicator = false
		page_el.removeEventListener('scroll', position_drop_indicator)
	}

	let dragging = {
		id: null,
		position: null
	}
	function reset_drag() {
		dragging = {
			id: null,
			position: null
		}
		hide_drop_indicator()
	}

	let dragging_over_section = false

	// detect drags over the page
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
				if (dragging_over_section) return // prevent double-adding block

				if (!showing_drop_indicator) {
					await show_drop_indicator()
				}
				position_drop_indicator()
				if (dragging.id !== 'PAGE' || dragging.position !== extractClosestEdge(self.data)) {
					dragging = {
						id: 'PAGE',
						position: extractClosestEdge(self.data)
					}
				}
			},
			onDragLeave() {
				reset_drag()
			},
			async onDrop({ source }) {
				if (!page_type || dragging_over_section) return // prevent double-adding block
				const block_being_dragged = source.data.block
				page_type.sections.push({ symbol: block_being_dragged })
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
			async onDrag({ self }) {
				hovered_block_el = self.element
				if (!showing_drop_indicator) {
					await show_drop_indicator()
				}
				position_drop_indicator()
				if (dragging.id !== self.data.section[ID] || dragging.position !== extractClosestEdge(self.data)) {
					dragging = {
						id: self.data.section[ID],
						position: extractClosestEdge(self.data)
					}
				}
			},
			onDragEnter() {
				dragging_over_section = true
			},
			onDragLeave() {
				reset_drag()
				dragging_over_section = false
			},
			onDrop({ self, source }) {
				if (!page_type) return
				const closestEdgeOfTarget = extractClosestEdge(self.data)
				const section_dragged_over = self.data.section
				const block_being_dragged = source.data.block
				const section_dragged_over_index = page_type.sections.findIndex((s) => s[ID] === section_dragged_over[ID])
				const target_index = closestEdgeOfTarget === 'top' ? section_dragged_over_index : section_dragged_over_index + 1
				page_type.sections = [...page_type.sections.slice(0, target_index), { symbol: block_being_dragged }, ...page_type.sections.slice(target_index)]
			}
		})
	}
	$effect(() => {
		if (sections_mounted === page_type?.sections.length && sections_mounted !== 0) {
			page_mounted = true
		}
	})
</script>

<!-- Loading Spinner -->
{#if !page_mounted && page_type?.sections.length}
	<div class="spinner">
		<UI.Spinner variant="loop" />
	</div>
{/if}

<!-- Drop Indicator -->
{#if showing_drop_indicator}
	<DropIndicator bind:node={drop_indicator_element} />
{/if}

<!-- Block Buttons -->
{#if showing_block_toolbar}
	<BlockToolbar
		bind:node={block_toolbar_element}
		id={hovered_section_id}
		i={page_type?.sections.findIndex((s) => s[ID] === hovered_section_id)}
		on:delete={async () => {
			if (!page_type) return
			page_type.sections = page_type.sections.filter((s) => s[ID] !== hovered_section_id)
		}}
		on:edit-code={() => edit_component(hovered_section_id, true)}
		on:edit-content={() => edit_component(hovered_section_id)}
		on:moveUp={async () => {
			moving = true
			hide_block_toolbar()
			// TODO
			setTimeout(() => {
				moving = false
			}, 300)
		}}
		on:moveDown={async () => {
			moving = true
			hide_block_toolbar()
			// TODO
			setTimeout(() => {
				moving = false
			}, 300)
		}}
	/>
{/if}

<!-- Page Blocks -->
<main id="#Page" data-test bind:this={page_el} class:fadein={page_mounted} lang={$locale} use:drag_fallback>
	{#each page_type?.sections ?? [] as section (section[ID])}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_mouse_events_have_key_events -->
		{@const locked = undefined}
		<!-- {@const in_current_tab = locked?.instance_key === instance_key} -->
		{@const in_current_tab = false}
		<div
			role="region"
			use:drag_item={section}
			data-section={section[ID]}
			data-symbol={section.symbol[ID]}
			id="section-{section[ID]}"
			class:locked
			onmousemove={() => {
				if (!moving && !showing_block_toolbar) {
					show_block_toolbar()
				}
			}}
			onmouseenter={async ({ target }) => {
				hovered_section_id = section[ID]
				hovered_block_el = target
				if (!moving) {
					show_block_toolbar()
				}
			}}
			onmouseleave={hide_block_toolbar}
			in:fade={{ duration: 100 }}
			animate:flip={{ duration: 100 }}
			data-test-id="page-type-section-{section[ID]}"
			style="min-height: 3rem;overflow:hidden;position: relative;"
		>
			{#if locked && !in_current_tab}
				<LockedOverlay {locked} />
			{/if}
			<ComponentNode
				{section}
				block={section.symbol}
				on:lock={() => lock_block(section[ID])}
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
</main>

<!-- {@html html_below || ''} -->

<style lang="postcss">
	.spinner {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 5;
		--Spinner-font-size: 3rem;
		--Spinner-color: var(--weave-primary-color);
		--Spinner-color-opaque: rgba(248, 68, 73, 0.2);
	}
	main {
		transition: 0.2s opacity;
		opacity: 0;
		border-top: 0;
		height: 100%;
		/* padding-top: 42px; */
		overflow: auto;
		box-sizing: border-box;
		overflow: auto;
	}
	main.fadein {
		opacity: 1;
	}
</style>
