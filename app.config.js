import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [
		sveltekit()
	],
	optimizeDeps: {
		exclude: ['@atlaskit/pragmatic-drag-and-drop-hitbox']
	}
})
