<script module>
	let Editor, Extension
	import('@tiptap/core').then((module) => {
		Editor = module.Editor
		Extension = module.Extension
	})
</script>

<script lang="ts">
	import { onMount, untrack } from 'svelte'
	import * as _ from 'lodash-es'
	import { fade } from 'svelte/transition'
	import * as Dialog from '$lib/components/ui/dialog'
	import ImageModal from '$lib/builder/views/modal/ImageModal.svelte'
	import ImageField from '$lib/builder/field-types/ImageField.svelte'
	import LinkField from '$lib/builder/field-types/Link.svelte'
	import LinkModal from '$lib/builder/views/modal/LinkModal.svelte'
	import VideoModal from '$lib/builder/views/modal/VideoModal.svelte'
	import Icon from '@iconify/svelte'
	import Typography from '@tiptap/extension-typography'
	import StarterKit from '@tiptap/starter-kit'
	import Image from '@tiptap/extension-image'
	import Youtube from '@tiptap/extension-youtube'
	import Highlight from '@tiptap/extension-highlight'
	import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
	import Link from '@tiptap/extension-link'
	import { all, createLowlight } from 'lowlight'
	import { tick, createEventDispatcher } from 'svelte'
	import { createUniqueID } from '$lib/builder/utils'
	import { processCode, compare_urls } from '$lib/builder/utils'
	import { hovering_outside } from '$lib/builder/utilities'
	import { locale } from '$lib/builder/stores/app/misc'
	import { site_html } from '$lib/builder/stores/app/page'
	import MarkdownButton from './MarkdownButton.svelte'
	import { component_iframe_srcdoc } from '$lib/builder/components/misc'
	import { getContent } from '$lib/pocketbase/content'
	import type { ObjectOf } from '$lib/pocketbase/CollectionMapping'
	import { SiteSymbolFields, SiteSymbols, type PageSections, type PageTypeSections, PageSectionEntries, PageTypeSectionEntries, manager } from '$lib/pocketbase/collections'

	const lowlight = createLowlight(all)

	const dispatch = createEventDispatcher()

	let { block, section }: { block: ObjectOf<typeof SiteSymbols>; section: ObjectOf<typeof PageTypeSections> | ObjectOf<typeof PageSections> } = $props()

	let node = $state()

	const fields = $derived(block.fields())
	const entries = $derived('page_type' in section ? section.entries() : 'page' in section ? section.entries() : undefined)
	const component_data = $derived(fields && entries && (getContent(section, fields, entries)[$locale] ?? {}))

	let floating_menu = $state()
	let bubble_menu = $state()
	let image_editor = $state()
	let image_editor_is_visible = $state(false)

	let link_editor = $state()
	let link_editor_is_visible = $state(false)

	let active_editor = $state()

	let error = $state('')

	let generated_js = $state('')
	async function generate_component_code(block) {
		const res = await processCode({
			component: {
				head: '',
				html: block.html,
				css: block.css,
				js: block.js,
				data: component_data
			},
			buildStatic: false,
			hydrated: true
		})
		if (res.error) {
			error = res.error
			dispatch_mount()
		} else {
			error = ''
			generated_js = res.js
		}
	}

	let scrolling = false

	const markdown_classes = {}

	async function make_content_editable() {
		if (!node?.contentDocument) return

		const doc = node.contentDocument
		const valid_elements = Array.from(doc.querySelectorAll(`img, a, p, span, h1, h2, h3, h4, h5, h6, div`)).filter((element) => {
			const [child_node] = Array.from(element.childNodes).filter((node) => {
				const has_text = node?.nodeName === '#text' && node.nodeValue.trim().length > 0
				return has_text
			})

			const html = element?.innerHTML?.trim() || ''

			if (html || child_node || element.tagName === 'IMG' || element.tagName === 'A') {
				return true
			}
		})

		// loop over component_data and match to elements
		const assigned_entry_ids = new Set() // elements that have been matched to a field ID

		const static_field_types = ['text', 'link', 'image', 'markdown']
		const static_fields = fields.filter((f) => static_field_types.includes(f.type)) ?? []

		for (const field of static_fields) {
			const relevant_entries = entries.filter((e) => e.field === field.id)
			for (const entry of relevant_entries) {
				search_elements_for_value({
					id: entry.id,
					key: field.key,
					value: entry.value,
					type: field.type,
					config: field.config
				})
			}
		}

		function search_elements_for_value({ id, key, value, type, options = {} }) {
			for (const element of valid_elements) {
				if (element.dataset['entry']) continue // element is already tagged, skip

				const matched = match_value_to_element({
					id,
					key,
					value,
					type,
					element,
					options
				})
				if (matched) {
					assigned_entry_ids.add(id)
					break
				}
			}
		}

		function match_value_to_element({ id, element, key, value, type, options = {} }) {
			// if (value === '' || !value) return false

			// ignore element
			if (element.dataset.key === '') {
				return false
			}

			// Match by explicitly set key
			const key_matches = element.dataset.key === key
			if (key_matches) {
				if (type === 'markdown') {
					set_editable_markdown({ element, key, id })
				} else if (type === 'image') {
					set_editable_image({ element, id, options })
				} else if (type === 'link') {
					set_editable_link({ element, id, url: value.url })
				} else {
					set_editable_text({ element, id })
				}
				return true
			}

			// Match by inferring key by type
			if (type === 'link' && element.nodeName === 'A') {
				const external_url_matches = value.url?.replace(/\/$/, '') === element.href?.replace(/\/$/, '')
				const internal_url_matches = window.location.origin + value.url?.replace(/\/$/, '') === element.href?.replace(/\/$/, '')
				const link_matches = (external_url_matches || internal_url_matches) && value.label === element.innerText

				if (link_matches) {
					set_editable_link({ element, id, key, url: value.url })
					return true
				}
			} else if (type === 'image' && element.nodeName === 'IMG') {
				const image_matches = compare_urls(value.url, element.src)
				if (image_matches) {
					set_editable_image({ element, id, options })
					return true
				}
			} else if (type === 'markdown' && element.nodeName === 'DIV') {
				const html = element.innerHTML?.trim()
				const html_matches = html === value.html
				if (html_matches && html.length > 0) {
					set_editable_markdown({ element, key, id })
					return true
				}
			} else if (type === 'text') {
				const text = element.innerText?.trim()
				const text_matches = typeof value == 'string' && value.trim() === text

				// All other field types are text
				if (text_matches && text.length > 0) {
					set_editable_text({ id, element })
					return true
				} else return false
			}
		}

		async function set_editable_markdown({ id, key, element }) {
			const html = element.innerHTML.trim()
			element.innerHTML = ''

			// move element classes to tiptap div
			const markdown_id = element.getAttribute('data-markdown-id') || createUniqueID()
			let saved_markdown_classes = markdown_classes[markdown_id]
			if (!saved_markdown_classes) {
				markdown_classes[markdown_id] = element.className
				saved_markdown_classes = markdown_classes[markdown_id]
				element.classList.remove(...element.classList)
				element.setAttribute('data-markdown-id', markdown_id) // necessary since data-markdown-id gets cleared when hydrating (i.e. editing from fields)
			}

			const editor = new Editor({
				content: html,
				element,
				extensions: [
					StarterKit,
					Image,
					Youtube.configure({
						modestBranding: true
					}),
					Typography,
					CodeBlockLowlight.configure({
						lowlight
					}),
					Link.configure({
						HTMLAttributes: {
							class: 'link'
						},
						openOnClick: false
					}),
					// TipTapImage.configure({}),
					Highlight.configure({ multicolor: false }),
					Extension.create({
						onFocus() {
							active_editor = editor
							dispatch('lock')
						},
						onBlur() {
							dispatch('unlock')
						},
						onUpdate: async ({ editor }) => {
							const html = editor.getHTML()
							save_edited_value({ id, value: { html } })
						}
					})
				],
				editorProps: {
					attributes: {
						class: saved_markdown_classes,
						'data-markdown-id': markdown_id
					}
				}
			})
		}

		async function set_editable_image({ element, id, options }) {
			let rect
			element.setAttribute(`data-entry`, id)
			element.onmousemove = (e) => {
				if (!image_editor_is_visible) {
					attach_image_overlay(e)
				}
			}
			async function attach_image_overlay(e) {
				image_editor_is_visible = true
				await tick()
				const iframe_rect = node.getBoundingClientRect()
				rect = element.getBoundingClientRect()
				image_editor.style.left = `${rect.left + iframe_rect.left}px`
				image_editor.style.top = `${rect.top + iframe_rect.top}px`
				image_editor.style.width = `${rect.width}px`
				image_editor.style.height = `${rect.height}px`
				image_editor.style.borderRadius = getComputedStyle(element).borderRadius

				image_editor.onwheel = (e) => {
					image_editor_is_visible = false
				}

				image_editor.onmouseleave = (e) => {
					const is_outside = e.x >= Math.floor(rect.right) || e.y >= Math.floor(rect.bottom) || e.x <= Math.floor(rect.left) || e.y <= Math.floor(rect.top)
					if (is_outside) {
						image_editor_is_visible = false
					}
				}
				image_editor.onclick = () => {
					current_image_element = element
					current_image_id = id
					current_image_value = {
						url: element.src || '',
						alt: element.alt || ''
					}
					editing_image = true
					image_editor_is_visible = false
				}
			}
		}

		async function set_editable_link({ element, id, url }) {
			element.style.outline = '0'
			element.setAttribute(`data-entry`, id)
			element.contentEditable = true
			let updated_url = url
			let rect
			element.onkeydown = (e) => {
				if (e.code === 'Enter') {
					e.preventDefault()
					e.target.blur()
					link_editor_is_visible = false
					save_edited_value({
						id,
						value: {
							url: updated_url,
							label: element.innerText
						}
					})
				}
			}
			element.addEventListener(
				'click',
				(e) => {
					e.preventDefault()
					e.stopPropagation()
					current_link_element = element
					current_link_id = id
					current_link_value = {
						url: element.href || '',
						label: element.innerText || '',
						active: true
					}
					editing_link = true
				},
				{ capture: true }
			)
		}

		async function set_editable_text({ id, element }) {
			element.style.outline = '0'
			element.setAttribute(`data-entry`, id)
			element.onkeydown = (e) => {
				if (e.code === 'Enter') {
					e.preventDefault()
					e.target.blur()
				}
			}
			element.onblur = (e) => {
				dispatch('unlock')
				save_edited_value({ id, value: e.target.innerText })
			}
			element.onfocus = () => {
				dispatch('lock')
			}
			element.contentEditable = true
		}
	}

	async function save_edited_value({ id, value }) {
		// Find the entry by ID
		const entry = entries?.find((entry) => entry.id === id)
		if (!entry) {
			console.error('Entry not found for ID:', id)
			return
		}

		// Update the entry based on section type
		if ('page_type' in section) {
			PageTypeSectionEntries.update(entry.id, { value })
		} else if ('page' in section) {
			PageSectionEntries.update(entry.id, { value })
		}

		// Commit changes with a delay to batch multiple edits
		clearTimeout(commit_task)
		commit_task = setTimeout(() => manager.commit(), 500)
	}

	let commit_task

	let mounted = false
	function dispatch_mount() {
		if (!mounted) {
			dispatch('mount')
			mounted = true
		}
	}

	// Reroute links to correctly open externally and internally
	async function reroute_links() {
		if (!node?.contentDocument) return
		const { pathname, origin } = window.location
		const [site] = pathname.split('/').slice(1)
		const site_url = `${origin}/${site}`
		node.contentDocument.querySelectorAll('a').forEach((link) => {
			// Skip editable links - they have their own handlers
			if (link.dataset.entry || link.dataset.key) {
				return
			}

			link.onclick = (e) => {
				e.preventDefault()
			}

			// link internally
			if (window.location.host === link.host) {
				// TODO: restore, but use a 'link' button
				// link navigates to site home
				// if (link.pathname === '/') {
				// 	link.addEventListener('click', () => {
				// 		goto(`${site_url}/`)
				// 	})
				// 	return
				// }
				// const page_slugs = link.pathname.split('/').slice(1)
				// const page_path = page_slugs.join('/')
				// // Link to page
				// const page_exists = page_slugs.every((slug, i) => {
				// 	const parent_page_id = $pages.find((p) => p.slug === page_slugs[i - 1])?.id || null
				// 	return $pages.find((p) => p.slug === slug && p.parent === parent_page_id)
				// })
				// if (page_exists) {
				// 	link.addEventListener('click', () => {
				// 		goto(`${site_url}/${page_path}`)
				// 	})
				// } else {
				// 	// TODO: Create page
				// }
			} else {
				openLinkInNewWindow(link)
			}

			function openLinkInNewWindow(link) {
				if (link.dataset.key || link.dataset.entry) return // is editable
				link.addEventListener('click', () => {
					window.open(link.href, '_blank')
				})
			}
		})
	}

	function on_page_scroll() {
		image_editor_is_visible = false
		link_editor_is_visible = false
		bubble_menu.style.display = 'none'
		floating_menu.style.display = 'none'
	}

	function on_hover_outside_image_editor(e) {
		if (hovering_outside(e, image_editor)) {
			image_editor_is_visible = false
		}
	}

	let compiled_code = $state<string>('')
	$effect(() => {
		if (block && component_data && compiled_code !== block.html) {
			generate_component_code(block)
			compiled_code = block.html
		}
	})

	let mutation_observer
	let iframe_resize_observer = $state()

	onMount(() => {
		mutation_observer = new MutationObserver(() => {
			dispatch_mount()
			reroute_links()
		})

		// Resize component iframe wrapper on resize to match content height (message set from `setup_component_iframe`)
		window.addEventListener('message', (event) => {
			if (node && event.data?.type === 'resize') {
				if (event.data.id === section.id) {
					node.style.height = event.data.height + 'px'
				}
			}
		})

		// Hide Editor UI on scroll and hover outside
		document.querySelector('#Page')?.addEventListener('scroll', on_page_scroll)
		document.querySelector('#Page')?.addEventListener('mouseover', on_hover_outside_image_editor)

		return () => {
			mutation_observer?.disconnect()
			iframe_resize_observer?.disconnect()

			document.querySelector('#Page')?.removeEventListener('scroll', on_page_scroll)
			document.querySelector('#Page')?.removeEventListener('mouseover', on_hover_outside_image_editor)
		}
	})

	function update_menu_positions() {
		if (!node?.contentDocument || !floating_menu || !bubble_menu) return
		const iframe_rect = node.getBoundingClientRect()
		const selection = node.contentDocument.getSelection()

		if (selection?.rangeCount > 0) {
			const range = selection.getRangeAt(0)
			const hasSelection = selection.toString().length > 0

			// Bubble menu logic
			if (hasSelection) {
				const rect = range.getBoundingClientRect()
				bubble_menu.style.position = 'fixed'
				bubble_menu.style.left = `${rect.left + iframe_rect.left}px`
				bubble_menu.style.top = `${rect.bottom + iframe_rect.top + 10}px`
				bubble_menu.style.display = 'flex'
			} else {
				bubble_menu.style.display = 'none'
			}

			// Floating menu logic
			const startNode = range.startContainer
			const blockElement = startNode.nodeType === 3 ? startNode.parentElement : startNode
			const isTopLevelBlock = blockElement?.parentElement?.matches('.ProseMirror')
			const isEmptyParagraph = blockElement?.textContent === ''
			const isAtStart = range.startOffset === 0

			if (isEmptyParagraph && isAtStart && isTopLevelBlock) {
				const rect = blockElement.getBoundingClientRect()
				floating_menu.style.position = 'fixed'
				floating_menu.style.left = `${rect.left + iframe_rect.left + 10}px`
				floating_menu.style.top = `${rect.top + iframe_rect.top + 7}px`
				floating_menu.style.display = 'flex'
			} else {
				floating_menu.style.display = 'none'
			}
		}
	}

	let setup_complete = $state(false)
	function setup_component_iframe() {
		setup_complete = false
		// Wait for iframe to be ready
		node.removeEventListener('load', setup)

		if (node.contentDocument.readyState === 'complete') {
			setup()
		} else {
			node.addEventListener('load', setup)
		}

		function setup() {
			const doc = node.contentDocument

			// Disconnect previous observer if it exists
			iframe_resize_observer?.disconnect()

			const update_height = () => {
				const height = doc.body.clientHeight
				window.postMessage({ type: 'resize', height, id: section.id }, '*')
				dispatch('resize')
			}

			iframe_resize_observer = new ResizeObserver(update_height)
			iframe_resize_observer.observe(doc.body)

			// Add mutation observer for DOM changes
			mutation_observer.observe(doc.body, {
				childList: true,
				subtree: true,
				attributes: true,
				characterData: true
			})

			doc.addEventListener('mouseup', update_menu_positions)
			doc.addEventListener('keyup', update_menu_positions)

			setup_complete = true
		}
	}

	$effect(() => {
		if (setup_complete && component_data) {
			send_component_to_iframe(generated_js, component_data)
		}
	})

	async function send_component_to_iframe(js, data) {
		try {
			node.contentWindow.postMessage({ type: 'component', payload: { js, data } }, '*')
			setTimeout(make_content_editable, 200) // wait for component to mount within iframe
		} catch (e) {
			console.error(e)
			error = e
			dispatch_mount()
		}
	}

	// Handle bubble and float menu positioning
	$effect(() => {
		const doc = node?.contentDocument
		if (doc) {
			const events = ['selectionchange', 'keyup', 'mouseup', 'touchend']

			const update = _.debounce(update_menu_positions, 50)
			events.forEach((event) => doc.addEventListener(event, update))

			return () => {
				events.forEach((event) => doc.removeEventListener(event, update))
			}
		}
	})

	let editing_image = $state(false)
	let editing_link = $state(false)
	let editing_video = $state(false)
	let current_image_element = $state(null)
	let current_image_id = $state(null)
	let current_image_value = $state({ url: '', alt: '' })
	let current_link_element = $state(null)
	let current_link_id = $state(null)
	let current_link_value = $state({ url: '', label: '', active: true })
</script>

<Dialog.Root bind:open={editing_image}>
	<Dialog.Content class="z-[999] sm:max-w-[500px] pt-12">
		<ImageField
			entity={section}
			field={fields?.find((f) => entries?.find((e) => e.id === current_image_id)?.field === f.id) || { label: 'Image', key: 'image', type: 'image', config: {} }}
			entry={{
				value: current_image_value
			}}
			onchange={(value) => {
				// Only update local state, don't save yet
				current_image_value = value
			}}
		/>
		<div class="flex justify-end gap-2 mt-2">
			<button
				onclick={() => {
					if (active_editor) {
						// Handle TipTap editor images
						active_editor.chain().focus().setImage({ src: current_image_value.url, alt: current_image_value.alt }).run()
					} else if (current_image_element && current_image_id) {
						// Handle direct image editing
						current_image_element.src = current_image_value.url
						current_image_element.alt = current_image_value.alt
						save_edited_value({ id: current_image_id, value: current_image_value })
					}
					editing_image = false
				}}
				class="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-md"
			>
				Done
			</button>
		</div>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={editing_link}>
	<Dialog.Content class="z-[999] sm:max-w-[500px] pt-12 overflow-visible">
		<LinkField
			entity={section}
			field={fields?.find((f) => entries?.find((e) => e.id === current_link_id)?.field === f.id) || { label: 'Link', key: 'link', type: 'link', config: {} }}
			entry={{
				value: current_link_value
			}}
			onchange={(value) => {
				// Only update local state, don't save yet
				current_link_value = value
			}}
		/>
		<div class="flex justify-end gap-2 mt-2">
			<button
				onclick={() => {
					if (active_editor) {
						// Handle TipTap editor links
						active_editor.chain().focus().setLink({ href: current_link_value.url }).run()
					} else if (current_link_element && current_link_id) {
						// Handle direct link editing
						current_link_element.href = current_link_value.url
						current_link_element.innerText = current_link_value.label
						save_edited_value({ id: current_link_id, value: current_link_value })
					}
					editing_link = false
				}}
				class="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-md"
			>
				Done
			</button>
		</div>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={editing_video}>
	<Dialog.Content class="z-[999] max-w-[60px]">
		<VideoModal
			onsave={(url) => {
				if (url) {
					active_editor.commands.setYoutubeVideo({
						src: url,
						width: '100%'
					})
				}
				editing_video = false
			}}
		/>
	</Dialog.Content>
</Dialog.Root>

{#if image_editor_is_visible}
	<button style:pointer-events={scrolling ? 'none' : 'all'} in:fade={{ duration: 100 }} class="primo-reset image-editor" bind:this={image_editor}>
		<Icon icon="uil:image-upload" />
	</button>
{/if}

{#if link_editor_is_visible}
	<div in:fade={{ duration: 100 }} class="primo-reset link-editor" bind:this={link_editor}>
		<button onclick={() => (link_editor_is_visible = false)}>
			<Icon icon="ic:round-close" />
		</button>
		<button class="icon" data-link>
			<Icon icon="heroicons-solid:external-link" />
		</button>
		<form>
			<input type="text" />
		</form>
	</div>
{/if}

{#if $site_html && generated_js}
	<iframe
		frameborder="0"
		bind:this={node}
		title="block"
		srcdoc={component_iframe_srcdoc({
			head: $site_html
		})}
		onload={setup_component_iframe}
	></iframe>
{/if}

{#if error}
	<pre>
    {@html error}
  </pre>
{/if}

<div class="menu floating-menu primo-reset" bind:this={floating_menu} style="display:none">
	{#if active_editor}
		<MarkdownButton
			icon="fa-solid:heading"
			onclick={(e) => {
				e.target.blur()
				active_editor.chain().focus().toggleHeading({ level: 1 }).run()
			}}
		/>
		<MarkdownButton icon="fa-solid:code" onclick={() => active_editor.chain().focus().toggleCodeBlock().run()} />
		<MarkdownButton icon="fa-solid:quote-left" onclick={() => active_editor.chain().focus().toggleBlockquote().run()} />
		<MarkdownButton icon="fa-solid:list" onclick={() => active_editor.chain().focus().toggleBulletList().run()} />
		<MarkdownButton icon="fa-solid:list-ol" onclick={() => active_editor.chain().focus().toggleOrderedList().run()} />
		<MarkdownButton icon="fa-solid:image" onclick={() => (editing_image = true)} />
		<MarkdownButton icon="lucide:youtube" onclick={() => (editing_video = true)} />
	{/if}
</div>
<div class="menu bubble-menu primo-reset" bind:this={bubble_menu} style="display:none">
	{#if active_editor}
		<MarkdownButton icon="fa-solid:link" onclick={() => (editing_link = true)} />
		<MarkdownButton icon="fa-solid:bold" onclick={() => active_editor.chain().focus().toggleBold().run()} active={active_editor.isActive('bold')} />
		<MarkdownButton icon="fa-solid:italic" onclick={() => active_editor.chain().focus().toggleItalic().run()} active={active_editor.isActive('italic')} />
		<MarkdownButton icon="fa-solid:highlighter" onclick={() => active_editor.chain().focus().toggleHighlight().run()} active={active_editor.isActive('highlight')} />
	{/if}
</div>

<style lang="postcss">
	iframe {
		width: 100%;

		/* Prevent background color leaking through from behind the IFrame. */
		background-color: white;
	}
	pre {
		margin: 0;
		padding: 1rem;
		background: var(--primo-color-black);
		color: var(--color-gray-3);
		border: 1px solid var(--color-gray-6);
	}
	.menu {
		font-size: var(--font-size-1);
		display: flex;
		border-radius: var(--input-border-radius);
		/* margin-left: 0.5rem; */
		transition: opacity 0.1s;
		z-index: 999999 !important;
		box-shadow:
			0 0 #0000,
			0 0 #0000,
			0 1px 2px 0 rgba(0, 0, 0, 0.05);
	}
	.bubble-menu {
		overflow: hidden;
		background-color: var(--color-gray-9);
		color: var(--primo-color-white);
		/* border-bottom-width: 2px; */
		border-color: var(--weave-primary-color);
	}
	.floating-menu {
		overflow: hidden;
		transform: translateY(-0.5rem);
		color: var(--color-gray-8);
		background-color: var(--primo-color-white);
	}
	.image-editor {
		position: fixed;
		font-size: 14px;
		background: rgba(0, 0, 0, 0.8);
		color: white;
		border-bottom-right-radius: 4px;
		z-index: 99;
		transform-origin: top left;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 2rem;
		overflow: visible;

		:global(svg) {
			height: clamp(0.5rem, 50%, 4rem);
			width: auto;
		}
	}

	.link-editor {
		position: fixed;
		font-size: 14px;
		background: rgba(0, 0, 0, 0.9);
		color: white;
		z-index: 999;
		display: flex;

		button {
			background: var(--color-gray-7);
			display: flex;
			align-items: center;
			padding: 0 5px;
			border-right: 1px solid var(--color-gray-6);
		}

		input {
			padding: 2px 5px;
			background: var(--color-gray-8);
			color: var(--color-gray-1);
			outline: 0;
		}
	}
</style>
