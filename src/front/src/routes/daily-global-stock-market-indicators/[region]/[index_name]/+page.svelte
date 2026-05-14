<script>
    // Importamos onMount para ejecutar código al cargar la página
    import { onMount } from 'svelte';
    // Importamos 'page' de las tiendas (stores) de SvelteKit. 
    // Esto nos permite leer la URL actual en la que está el usuario.
    import { page } from '$app/stores';

    // Extraemos los parámetros exactos de la URL.
    // Si la URL es "/daily-global-stock-market-indicators/Europe/DAX",
    // SvelteKit detecta automáticamente que region="Europe" e index_name="DAX"
    let region = $page.params.region;
    let index_name = $page.params.index_name;

    // Usamos $state (Svelte 5) para crear el objeto reactivo que guardará los datos.
    // Inicializamos 'index_name' y 'region' con los valores que hemos sacado de la URL.
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

    // Variables reactivas para controlar las notificaciones de éxito o error
    let mensaje = $state('');
    let esError = $state(false);

    // Función auxiliar para mostrar notificaciones temporalmente
    function mostrarMensaje(texto, error = false) {
        mensaje = texto;
        esError = error;
        // Ocultamos el mensaje pasados 5 segundos
        setTimeout(() => { mensaje = ''; }, 5000);
    }

    // 1. CARGAR DATOS (GET) - Traemos la información actual antes de editarla
    async function cargarIndicador() {
        try {
            // Hacemos la petición a la API pidiendo el recurso exacto
            const res = await fetch(`/api/v1/daily-global-stock-market-indicators/${region}/${index_name}`);
            
            if (res.ok) {
                // Si va bien, rellenamos nuestro objeto 'indicador' con los datos de la base de datos.
                // Como usa $state, los inputs del HTML se rellenarán solos automáticamente.
                indicador = await res.json();
            } else {
                mostrarMensaje('Error: No se pudo cargar el registro.', true);
            }
        } catch (error) {
            mostrarMensaje('Error de conexión con el servidor.', true);
        }
    }

    // 2. GUARDAR CAMBIOS (PUT) - Enviamos los datos modificados al backend
    async function actualizarIndicador() {
        // Validación en el frontend: Comprobamos que el usuario no haya dejado campos en blanco
        const camposVacios = Object.values(indicador).some(valor => valor === '' || valor === null);
        if (camposVacios) {
            mostrarMensaje('Error: Todos los campos son obligatorios.', true);
            return; // Cortamos la ejecución para no enviar datos incompletos
        }

        try {
            // Hacemos una petición PUT (que es el estándar REST para actualizar)
            const res = await fetch(`/api/v1/daily-global-stock-market-indicators/${region}/${index_name}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(indicador) // Convertimos el objeto JS a JSON
            });

            // Comprobamos los códigos de estado HTTP que nos devuelve el backend
            if (res.status === 200) {
                mostrarMensaje('¡Registro actualizado correctamente!');
            } else if (res.status === 400) {
                mostrarMensaje('Error: Datos incorrectos o faltan campos.', true);
            } else if (res.status === 404) {
                // 404 Not Found: El recurso que intentamos actualizar ya no existe
                mostrarMensaje('Error: El registro no existe.', true);
            } else {
                mostrarMensaje('Error inesperado al actualizar.', true);
            }
        } catch (error) {
            mostrarMensaje('Error de conexión con el servidor.', true);
        }
    }

    // Cuando el componente se carga en el navegador, ejecutamos la función para traernos los datos
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