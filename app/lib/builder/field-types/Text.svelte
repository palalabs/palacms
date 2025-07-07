<script lang="ts">
	import UI from '../ui'
	import type { Entity } from '$lib/pocketbase/content'
	import type { Field } from '$lib/common/models/Field'
	import type { Entry } from '$lib/common/models/Entry'

	let { field, entry, onchange }: { entity: Omit<Entity, 'id'>; field: Omit<Field, 'id'>; entry?: Omit<Entry, 'id'>; onchange: (value: string) => void } = $props()
</script>

<div>
	<UI.TextInput {...field} value={entry?.value ?? ''} oninput={(text) => onchange(text)} />
</div>

<style lang="postcss">
	div {
		width: 100%;
	}
</style>
