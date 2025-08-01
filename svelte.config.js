import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			pages: 'pb_public',
			fallback: 'index.html'
		}),
		paths: {
			base: '/admin'
		},
		files: {
			appTemplate: 'app/app.html',
			assets: 'app/assets',
			lib: 'app/lib',
			routes: 'app/routes'
		}
	},
	vitePlugin: {
		// inspector: true
	},
	onwarn: (warning, handler) => {
		// console.log({ warning })
		if (warning.code === 'css-unused-selector') return
		// Handle all other warnings normally
		handler(warning)
	}
}

export default config
