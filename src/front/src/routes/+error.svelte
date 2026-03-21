<h1> This page does not exist </h1><script>
    import { page } from '$app/stores';
</script>

<style>
    .error-container {
        text-align: center;
        padding: 60px 20px;
        background-color: white;
        border-radius: 12px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        max-width: 500px;
        width: 100%;
    }

    h1 {
        color: #ef4444; /* Rojo para el error */
        font-size: 4rem;
        margin: 0 0 10px 0;
    }

    p {
        color: #4b5563;
        margin-bottom: 25px;
    }

    a {
        display: inline-block;
        padding: 10px 20px;
        background-color: #3b82f6;
        color: white;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 500;
    }
</style>

<div class="error-container">
    <h1>{$page.status}</h1>
    <p>{$page.error?.message || 'Página no encontrada'}</p>
    <a href="/">Volver al inicio</a>
</div>