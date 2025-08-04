import { page_html } from './builder/code_generators'
import { usePageData } from './PageData.svelte'
import { PageTypes, Sites } from './pocketbase/collections'
import { self } from './pocketbase/PocketBase'

export const usePublishSite = (site_id?: string) => {
	let status = $state<'standby' | 'loading' | 'working'>('standby')
	let done = $state<(error?: unknown) => void>()

	const site = $derived(site_id ? Sites.one(site_id) : undefined)
	const { data } = $derived(status === 'standby' ? { data: undefined } : usePageData(site, site?.pages()))

	$effect(() => {
		if (!data) {
			return
		}

		if (status !== 'working') {
			status = 'working'
		} else {
			return
		}

		const promises: Promise<void>[] = []
		for (const page of data.pages) {
			if (!page.parent) {
				// Generate site preview from homepage
				const promise = page_html({
					...data,
					page,
					page_type: PageTypes.one(page.page_type)!,
					no_js: true
				}).then(async ({ success, html }) => {
					if (!success) {
						throw new Error('Generating site preview not successful')
					}
					if (!site) {
						throw new Error('No site')
					}

					await self.collection('sites').update(site.id, {
						preview: new File([html], 'index.html')
					})
				})
				promises.push(promise)
			}

			const promise = page_html({
				...data,
				page,
				page_type: PageTypes.one(page.page_type)!
			})
				.then(async ({ success, html }) => {
					if (!success) {
						throw new Error('Generating page not successful')
					}

					await self.collection('pages').update(page.id, {
						compiled_html: new File([html], 'index.html')
					})
				})
				.catch((error) => {
					console.error('Page compilation error:', error)
					throw error // Re-throw to be caught by Promise.all
				})
			promises.push(promise)
		}

		Promise.all(promises)
			.then(() => {
				status = 'standby'
				done?.()
			})
			.catch((error) => {
				console.error('Publish failed:', error)
				status = 'standby'
				done?.(error) // Pass error to the done callback
			})
	})

	return new (class {
		status = $derived(status)

		async publish() {
			status = 'loading'
			return new Promise<void>((resolve, reject) => {
				done = (error) => {
					if (error) {
						reject(error)
					} else {
						resolve()
					}
				}
			})
		}
	})()
}
