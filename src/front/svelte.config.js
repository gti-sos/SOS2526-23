import adapterVercel from '@sveltejs/adapter-vercel';
import adapterNode from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// Esta variable detecta si estamos en el entorno de Vercel
const isVercel = process.env.VERCEL === '1';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess(),
    kit: {
        // DINÁMICO: Si es Vercel, usa su adaptador. Si es GitHub Actions, usa Node.
        adapter: isVercel ? adapterVercel() : adapterNode()
    },
    vitePlugin: {
        dynamicCompileOptions: ({ filename }) =>
            filename.includes('node_modules') ? undefined : { runes: true }
    }
};

export default config;