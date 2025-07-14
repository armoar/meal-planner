import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import path from 'path';


/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	kit: { adapter: adapter(),
		 alias: {
			$lib: path.resolve('./src/lib'),
			$components: path.resolve('./src/components'),
			$modules: path.resolve('./src/modules'),
			$routes: path.resolve('./src/routes'),
			$stores: path.resolve('./src/lib/stores'),
			$utils: path.resolve('./src/lib/utils'),
			$constants: path.resolve('./src/lib/constants')
		 }
	 }

};

export default config;
