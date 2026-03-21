<script>
    import favicon from '$lib/assets/favicon.svg';
    import Header from './Header.svelte';
    import Footer from './Footer.svelte';

    let { children } = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<style>
    :global(body) {
        font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background-color: #f9fafb; /* Fondo gris muy suave */
        color: #1f2937; /* Texto oscuro para buena lectura */
        margin: 0;
        padding: 0;
        /* Hacemos que el body sea un flex container en columna y ocupe el 100% del alto */
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }

    main {
        flex: 1; /* Esto hace que el main crezca y empuje el footer al fondo */
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 40px 20px;
    }
</style>

<Header />

<main>
    {@render children()}
</main>

<Footer />