<script lang="ts">
	import type { Entity } from '$lib/pocketbase/content'
	import type { Field } from '$lib/common/models/Field'
	import type { Entry } from '$lib/common/models/Entry'

	let { field, entry, onchange }: { entity: Omit<Entity, 'id'>; field: Omit<Field, 'id'>; entry?: Omit<Entry, 'id'>; onchange: (value: string) => void } = $props()
	
	const value = $derived(entry?.value ?? '')
</script>

<div>
	<p class="label">{field.label}</p>
	<div class="container">
		<p class="value">{value}</p>
		<input oninput={({ target }) => onchange(target.value)} class="input" {value} type="range" />
	</div>
</div>

<style lang="postcss">
	div {
		width: 100%;
	}
	.label {
		font-size: 0.875rem;
		margin-bottom: 0.5rem;
		font-weight: 500;
	}
	.container {
		display: flex;
		gap: 0.5rem;
	}
	.value {
		font-size: 0.875rem;
		font-weight: 500;
	}

	input {
		outline-color: var(--weave-primary-color);
		background: var(--primo-color-black);
		padding: 0.5rem;
		border-bottom: 2px solid rgb(245, 245, 245);
		width: var(--Slider-width);
	}
</style>
