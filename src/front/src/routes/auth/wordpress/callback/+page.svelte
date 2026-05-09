<script>
    import { onMount } from 'svelte';

    onMount(() => {
        // 1. Leemos la URL actual del navegador
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        
        const token = params.get('access_token');

        if (token) {
            // 2. Guardamos el token en el LocalStorage (Frontend)
            localStorage.setItem('wp_token', token);
            // 3. Redirigimos al Dashboard
            window.location.href = '/integrations/global-ads-performance/api-wordpress';
        } else {
            console.error("No se recibió token de WordPress");
        }
    });
</script>

<div style="text-align: center; padding: 50px; font-family: sans-serif;">
    <h2>🔗 Autenticando con WordPress...</h2>
    <p>Conectando datos del blog de forma segura.</p>
</div>