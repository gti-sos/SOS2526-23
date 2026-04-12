import adapterVercel from '@sveltejs/adapter-vercel';
import adapterNode from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

<<<<<<< Updated upstream
=======
// Vercel inyecta automáticamente esta variable de entorno
>>>>>>> Stashed changes
const isVercel = process.env.VERCEL === '1';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess(),
    kit: {
<<<<<<< Updated upstream
=======
        // Usa Vercel en la nube y Node en GitHub Actions/Local
>>>>>>> Stashed changes
        adapter: isVercel ? adapterVercel() : adapterNode()
    },
    vitePlugin: {
        dynamicCompileOptions: ({ filename }) =>
            filename.includes('node_modules') ? undefined : { runes: true }
    }
};

export default config;