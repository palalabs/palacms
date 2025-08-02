import type { Plugin } from '@rollup/browser'
import bindings_wasm_bg_url from '@rollup/browser/dist/bindings_wasm_bg.wasm?raw'

export default function emitWasmFile(): Plugin {
	return {
		async generateBundle() {
			this.emitFile({
				fileName: 'bindings_wasm_bg.wasm',
				source: bindings_wasm_bg_url,
				type: 'asset'
			})
		},
		name: 'emit-wasm-file'
	}
}
