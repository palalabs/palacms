<script lang="ts">
	import autosize from 'autosize'
	import { onMount } from 'svelte'
	import TextInput from '../ui/TextInput.svelte'
	import type { Entity } from '$lib/pocketbase/content'
	import type { Field } from '$lib/common/models/Field'
	import type { Entry } from '$lib/common/models/Entry'

	let { field, entry, onchange }: { entity: Omit<Entity, 'id'>; field: Omit<Field, 'id'>; entry?: Omit<Entry, 'id'>; onchange: (value: string) => void } = $props()

	let element
	onMount(() => {
		autosize(element)
	})
</script>

<TextInput label={field.label} value={entry?.value} grow={true} oninput={onchange} />

<style lang="postcss">
</style>
