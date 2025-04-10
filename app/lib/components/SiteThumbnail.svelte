<script lang="ts">
	import SitePreview from '$lib/components/SitePreview.svelte'
	import { find as _find } from 'lodash-es'
	import type { Resolved } from '$lib/pocketbase/Resolved'
	import type { Site } from '$lib/common/models/Site'
	import type { Snippet } from 'svelte'

	let { site, children }: { site: Pick<Resolved<typeof Site>, 'id' | 'name' | 'group'>; children?: Snippet } = $props()
</script>

<div class="space-y-3 relative w-full bg-gray-900">
	<div class="rounded-tl rounded-tr overflow-hidden">
		<a data-sveltekit-prefetch href="/{site.id}">
			<SitePreview />
		</a>
	</div>
	<div class="absolute -bottom-2 rounded-bl rounded-br w-full p-3 z-20 bg-gray-900 truncate flex items-center justify-between">
		<a data-sveltekit-prefetch href="/{site.id}" class="text-sm font-medium leading-none hover:underline">{site.name}</a>
		<div>
			{@render children?.()}
		</div>
	</div>
</div>
