<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';

    // Obtenemos los parámetros exactos de la URL
    let region = $page.params.region;
    let index_name = $page.params.index_name;

    // Objeto para guardar los datos que vamos a editar
    let indicador = $state({
        date: '',
        index_name: index_name,
        region: region,
        open: '',
        high: '',
        low: '',
        close: '',
        volume: '',
        daily_change_percent: ''
    });

    // Mensajes de estado
    let mensaje = $state('');
    let esError = $state(false);

    function mostrarMensaje(texto, error = false) {
        mensaje = texto;
        esError = error;
        setTimeout(() => { mensaje = ''; }, 5000);
    }

    // 1. Cargar los datos actuales al entrar en la página
    async function cargarIndicador() {
        try {
            // PROTECCIÓN: Leer token de forma segura
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const cabeceras = token ? { 'Authorization': `Bearer ${token}` } : {};

            const res = await fetch(`/api/v1/daily-global-stock-market-indicators/${region}/${index_name}`, {
                headers: cabeceras // ¡Aquí estaba el fallo! Enviamos el token para poder LEER.
            });
            
            if (res.ok) {
                indicador = await res.json();
            } else {
                mostrarMensaje('Error: No se pudo cargar el registro.', true);
            }
        } catch (error) {
            mostrarMensaje('Error de conexión con el servidor.', true);
        }
    }

    // 2. Guardar los cambios (Hacer el PUT)
    async function actualizarIndicador() {
        // Validación frontend
        const camposVacios = Object.values(indicador).some(valor => valor === '' || valor === null);
        if (camposVacios) {
            mostrarMensaje('Error: Todos los campos son obligatorios.', true);
            return;
        }

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
            mostrarMensaje('Error: No has iniciado sesión. Por favor, inicia sesión primero.', true);
            return;
        }

        try {
            const res = await fetch(`/api/v1/daily-global-stock-market-indicators/${region}/${index_name}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(indicador)
            });

            if (res.status === 200) {
                mostrarMensaje('¡Registro actualizado correctamente!');
            } else if (res.status === 400) {
                mostrarMensaje('Error: Datos incorrectos o faltan campos.', true);
            } else if (res.status === 404) {
                mostrarMensaje('Error: El registro no existe.', true);
            } else {
                mostrarMensaje('Error inesperado al actualizar.', true);
            }
        } catch (error) {
            mostrarMensaje('Error de conexión con el servidor.', true);
        }
    }

    onMount(cargarIndicador);
</script>

<main style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
    
    <h1>Editar Indicador</h1>
    <a href="/daily-global-stock-market-indicators" style="color: #2196F3; text-decoration: none; font-weight: bold;">&larr; Volver a la tabla</a>

    {#if mensaje}
        <div style="padding: 15px; margin: 20px 0; border-radius: 5px; color: white; background-color: {esError ? '#f44336' : '#4CAF50'}; font-weight: bold;">
            {mensaje}
        </div>
    {/if}

    <section style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin-top: 20px; border: 1px solid #cce7ff;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
            <div>
                <label style="display: block; font-weight: bold; margin-bottom: 5px;">Región (No editable)</label>
                <input type="text" bind:value={indicador.region} readonly style="width: 100%; padding: 8px; background-color: #e9ecef; border: 1px solid #ccc;" />
            </div>
            <div>
                <label style="display: block; font-weight: bold; margin-bottom: 5px;">Índice (No editable)</label>
                <input type="text" bind:value={indicador.index_name} readonly style="width: 100%; padding: 8px; background-color: #e9ecef; border: 1px solid #ccc;" />
            </div>
            <div>
                <label style="display: block; font-weight: bold; margin-bottom: 5px;">Fecha</label>
                <input type="text" bind:value={indicador.date} style="width: 100%; padding: 8px;" />
            </div>
            <div>
                <label style="display: block; font-weight: bold; margin-bottom: 5px;">Apertura</label>
                <input type="number" bind:value={indicador.open} step="any" style="width: 100%; padding: 8px;" />
            </div>
            <div>
                <label style="display: block; font-weight: bold; margin-bottom: 5px;">Máximo</label>
                <input type="number" bind:value={indicador.high} step="any" style="width: 100%; padding: 8px;" />
            </div>
            <div>
                <label style="display: block; font-weight: bold; margin-bottom: 5px;">Mínimo</label>
                <input type="number" bind:value={indicador.low} step="any" style="width: 100%; padding: 8px;" />
            </div>
            <div>
                <label style="display: block; font-weight: bold; margin-bottom: 5px;">Cierre</label>
                <input type="number" bind:value={indicador.close} step="any" style="width: 100%; padding: 8px;" />
            </div>
            <div>
                <label style="display: block; font-weight: bold; margin-bottom: 5px;">Volumen</label>
                <input type="number" bind:value={indicador.volume} style="width: 100%; padding: 8px;" />
            </div>
            <div>
                <label style="display: block; font-weight: bold; margin-bottom: 5px;">Cambio Diario (%)</label>
                <input type="number" bind:value={indicador.daily_change_percent} step="any" style="width: 100%; padding: 8px;" />
            </div>
        </div>
        
        <button style="background-color: #4CAF50; color: white; border: none; padding: 12px 24px; cursor: pointer; border-radius: 4px; font-weight: bold; width: 100%;" on:click={actualizarIndicador}>
            Guardar Cambios
        </button>
    </section>

</main>