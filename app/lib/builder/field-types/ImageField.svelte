<script lang="ts">
	import * as _ from 'lodash-es'
	import Icon from '@iconify/svelte'
	import TextInput from '../ui/TextInput.svelte'
	import Spinner from '../ui/Spinner.svelte'
	import imageCompression from 'browser-image-compression'
	import type { ImageField } from '$lib/common/models/fields/ImageField'
	import type { Resolved } from '$lib/common/json'
	import type { Id } from '$lib/common/models/Id'
	import { require_site } from '$lib/loaders'
	import { page } from '$app/state'
	import { get_direct_entries } from '../stores/helpers'

	const default_value = {
		alt: '',
		url: ''
	}

	const { entity_id, field }: { entity_id: Id; field: Resolved<typeof ImageField> } = $props()
	const site_id = $derived(page.params.site)
	const site = $derived(require_site(site_id))
	const entry = $derived(get_direct_entries(entity_id, field)[0])

	async function upload_image(image) {
		loading = true

		// Get compression options from field config or use defaults
		const maxSizeMB = field.maxSizeMB ?? 1
		const maxWidthOrHeight = field.maxWidthOrHeight ?? 1920

		// Compression options
		const options = {
			maxSizeMB, // Maximum size in MB
			maxWidthOrHeight, // Resize large images to this dimension
			useWebWorker: true // Use web worker for better UI performance
		}

		// Compress the image
		const compressedImage = await imageCompression(image, options)

		await upload(compressedImage)

		async function upload(file) {
			// TODO: Implement
			throw new Error('Not implemented')
		}
	}

	let image_size = $state(null)
	let loading = $state(false)

	let width = $state<number | undefined>()
	let collapsed = $derived(!width || width < 200)
</script>

<div class="ImageField" bind:clientWidth={width} class:collapsed>
	<span class="primo--field-label">{field.label}</span>
	<div class="image-info">
		<div class="image-preview">
			{#if loading}
				<div class="spinner-container">
					<Spinner />
				</div>
			{:else}
				{#if image_size}
					<span class="field-size">
						{image_size}KB
					</span>
				{/if}
				{#if entry.value.url}
					<img src={entry.value.url} alt="Preview" />
				{/if}
				<label class="image-upload">
					<Icon icon="uil:image-upload" />
					{#if !entry.value.url}
						<span>Upload</span>
					{/if}
					<input
						onchange={({ target }) => {
							const { files } = target
							if (files.length > 0) {
								const image = files[0]
								upload_image(image)
							}
						}}
						type="file"
						accept="image/*"
					/>
				</label>
			{/if}
		</div>
		<div class="inputs">
			<TextInput value={entry.value.alt} label="Description" oninput={(alt) => (entry.value.alt = alt)} />
			<TextInput
				value={entry.value.url}
				label="URL"
				oninput={(value) => {
					entry.value.url = value
				}}
			/>
		</div>
	</div>
</div>
{@render children?.()}

<style lang="postcss">
	* {
		--TextInput-label-font-size: 0.75rem;
	}
	.ImageField {
		display: grid;

		&.collapsed .image-info {
			display: grid;
			gap: 0;
		}

		&.collapsed .inputs {
			padding: 0.5rem;
			background: var(--color-gray-9);
		}
	}
	.image-info {
		display: flex;
		gap: 0.75rem;
		overflow: hidden;
		align-items: flex-start;
		/* border: 1px solid var(--weave-primary-color); */
		/* padding: 0.5rem; */

		.spinner-container {
			background: var(--weave-primary-color);
			height: 100%;
			width: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 3rem;
		}
	}
	input {
		background: var(--color-gray-8);
	}
	.image-preview {
		border: 1px dashed #3e4041;
		border-radius: 4px;
		aspect-ratio: 1;
		height: 100%;
		/* width: 13rem; */
		position: relative;

		.image-upload {
			flex: 1 1 0%;
			padding: 1rem;
			cursor: pointer;
			position: relative;
			width: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			color: var(--color-gray-2);
			background: var(--color-gray-9);
			font-weight: 600;
			text-align: center;
			position: absolute;
			inset: 0;
			opacity: 0.5;
			transition: opacity, background;
			transition-duration: 0.1s;

			&:hover {
				opacity: 0.95;
				background: var(--weave-primary-color);
			}

			span {
				margin-top: 0.25rem;
			}

			input {
				visibility: hidden;
				border: 0;
				width: 0;
				position: absolute;
			}
		}

		.field-size {
			background: var(--color-gray-8);
			color: var(--color-gray-3);
			position: absolute;
			top: 0;
			left: 0;
			z-index: 1;
			padding: 0.25rem 0.5rem;
			font-size: var(--font-size-1);
			font-weight: 600;
			border-bottom-right-radius: 0.25rem;
		}

		img {
			position: absolute;
			inset: 0;
			object-fit: cover;
			height: 100%;
			width: 100%;
		}
	}

	.inputs {
		display: grid;
		row-gap: 6px;
		width: 100%;
		--TextInput-font-size: 0.75rem;
	}

	/* .image-type-buttons {
		margin-top: 3px;
		font-size: 0.75rem;
		display: flex;
		border-radius: var(--primo-border-radius);
		border: 1px solid var(--color-gray-8);
		justify-self: flex-start;

		button {
			padding: 2px 6px;

			&.active {
				cursor: unset;
				color: var(--weave-primary-color);
			}

			&:last-child {
				border-left: 1px solid var(--color-gray-8);
			}
		}
	} */
</style>
