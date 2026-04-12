import adapterVercel from '@sveltejs/adapter-vercel';
import adapterNode from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const isVercel = process.env.VERCEL === '1';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess(),
    kit: {
        adapter: isVercel ? adapterVercel() : adapterNode()
    },
    vitePlugin: {
        dynamicCompileOptions: ({ filename }) =>
            filename.includes('node_modules') ? undefined : { runes: true }
    }
};

export default config;