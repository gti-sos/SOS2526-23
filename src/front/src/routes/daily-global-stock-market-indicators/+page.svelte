<script>
    import { onMount } from 'svelte';

    // Aquí guardaremos los datos que vengan de la API
    let indicadores = $state([]);
    
    // Objeto para el formulario con tus campos exactos
    let nuevoIndicador = $state({
        date: '',
        index_name: '',
        region: '',
        open: '',
        high: '',
        low: '',
        close: '',
        volume: '',
        daily_change_percent: ''
    });

    // Variables para los mensajes de aviso (Punto 1.d)
    let mensaje = $state('');
    let esError = $state(false);

    // Función para mostrar mensajes amigables
    function mostrarMensaje(texto, error = false) {
        mensaje = texto;
        esError = error;
        // Ocultar el mensaje a los 5 segundos
        setTimeout(() => { mensaje = ''; }, 5000);
    }

    // 1. Obtener todos los recursos (Cargar la tabla)
    async function cargarIndicadores() {
        try {
            const res = await fetch('/api/v1/daily-global-stock-market-indicators');
            if (res.ok) {
                indicadores = await res.json();
            } else {
                mostrarMensaje('No se pudieron cargar los datos del mercado.', true);
            }
        } catch (error) {
            mostrarMensaje('Error de conexión con el servidor.', true);
        }
    }

    // 2. Crear un recurso (Añadir a la tabla)
    async function crearIndicador() {
        try {
            const res = await fetch('/api/v1/daily-global-stock-market-indicators', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoIndicador)
            });

            if (res.status === 201) {
                mostrarMensaje('¡Dato del mercado añadido correctamente!');
                cargarIndicadores(); // Recargar la tabla
                // Limpiar el formulario
                nuevoIndicador = { date: '', index_name: '', region: '', open: '', high: '', low: '', close: '', volume: '', daily_change_percent: '' };
            } else if (res.status === 409) {
                mostrarMensaje('Error: Ya existe un registro para esa región y ese índice.', true);
            } else if (res.status === 400) {
                mostrarMensaje('Error: Faltan datos por rellenar o el formato es incorrecto.', true);
            } else {
                mostrarMensaje('Ocurrió un error inesperado al guardar.', true);
            }
        } catch (error) {
            mostrarMensaje('Error de conexión con el servidor.', true);
        }
    }

    // 3. Borrar un recurso concreto (Eliminar un dato)
    async function borrarIndicador(region, index_name) {
        try {
            const res = await fetch(`/api/v1/daily-global-stock-market-indicators/${region}/${index_name}`, {
                method: 'DELETE'
            });

            if (res.status === 204 || res.status === 200) {
                mostrarMensaje('Dato eliminado con éxito.');
                cargarIndicadores(); // Recargar la tabla
            } else if (res.status === 404) {
                mostrarMensaje('Error: No se encontró el dato que intentas borrar.', true);
            } else {
                mostrarMensaje('Error al intentar borrar el dato.', true);
            }
        } catch (error) {
            mostrarMensaje('Error de conexión con el servidor.', true);
        }
    }

    // 4. Borrar TODOS los recursos
    async function borrarTodos() {
        if (!confirm('¿Estás seguro de que quieres borrar TODOS los datos de la tabla? Esta acción no se puede deshacer.')) return;

        try {
            const res = await fetch('/api/v1/daily-global-stock-market-indicators', {
                method: 'DELETE'
            });

            if (res.status === 204 || res.status === 200) {
                mostrarMensaje('¡Todos los datos han sido borrados de la base de datos!');
                cargarIndicadores();
            } else {
                mostrarMensaje('Error al intentar vaciar la base de datos.', true);
            }
        } catch (error) {
            mostrarMensaje('Error de conexión con el servidor.', true);
        }
    }

    // 5. Cargar datos iniciales de prueba
    async function cargarDatosIniciales() {
        try {
            const res = await fetch('/api/v1/daily-global-stock-market-indicators/loadInitialData');
            
            if (res.ok) {
                mostrarMensaje('¡Datos iniciales cargados correctamente!');
                cargarIndicadores(); // Actualizamos la tabla para que se vean al instante
            } else {
                mostrarMensaje('Error al cargar los datos iniciales.', true);
            }
        } catch (error) {
            mostrarMensaje('Error de conexión con el servidor.', true);
        }
    }

    // Cargar los datos nada más entrar a la página
    onMount(cargarIndicadores);
</script>

<main style="max-width: 1200px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
    
    <h1>Indicadores Diarios del Mercado de Valores</h1>
    <a href="/">&larr; Volver a la página principal</a>

    {#if mensaje}
        <div style="padding: 15px; margin: 20px 0; border-radius: 5px; color: white; background-color: {esError ? '#f44336' : '#4CAF50'}; font-weight: bold;">
            {mensaje}
        </div>
    {/if}

    <hr style="margin: 20px 0;">

    <section style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #cce7ff;">
        <h2>Añadir nuevo registro</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 15px;">
            <input type="text" placeholder="Fecha (Ej. 2024-01-01)" bind:value={nuevoIndicador.date} />
            <input type="text" placeholder="Región" bind:value={nuevoIndicador.region} />
            <input type="text" placeholder="Nombre del Índice" bind:value={nuevoIndicador.index_name} />
            <input type="number" placeholder="Apertura" bind:value={nuevoIndicador.open} step="any" />
            <input type="number" placeholder="Máximo" bind:value={nuevoIndicador.high} step="any" />
            <input type="number" placeholder="Mínimo" bind:value={nuevoIndicador.low} step="any" />
            <input type="number" placeholder="Cierre" bind:value={nuevoIndicador.close} step="any" />
            <input type="number" placeholder="Volumen" bind:value={nuevoIndicador.volume} />
            <input type="number" placeholder="Cambio Diario (%)" bind:value={nuevoIndicador.daily_change_percent} step="any" />
        </div>
        <button style="background-color: #2196F3; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; font-weight: bold;" on:click={crearIndicador}>
            Guardar dato
        </button>
    </section>

    <div style="margin-bottom: 20px; text-align: right;">
        <button style="background-color: #28a745; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 5px; font-weight: bold; margin-right: 10px;" on:click={cargarDatosIniciales}>
            Cargar datos iniciales
        </button>
        <button style="background-color: #f44336; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 5px; font-weight: bold;" on:click={borrarTodos}>
            ¡Borrar todos los registros!
        </button>
    </div>

    <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; min-width: 800px;">
            <thead>
                <tr style="background-color: #333; color: white;">
                    <th style="padding: 12px; border: 1px solid #ccc;">Fecha</th>
                    <th style="padding: 12px; border: 1px solid #ccc;">Región</th>
                    <th style="padding: 12px; border: 1px solid #ccc;">Índice</th>
                    <th style="padding: 12px; border: 1px solid #ccc;">Apertura</th>
                    <th style="padding: 12px; border: 1px solid #ccc;">Máximo</th>
                    <th style="padding: 12px; border: 1px solid #ccc;">Mínimo</th>
                    <th style="padding: 12px; border: 1px solid #ccc;">Cierre</th>
                    <th style="padding: 12px; border: 1px solid #ccc;">Volumen</th>
                    <th style="padding: 12px; border: 1px solid #ccc;">Cambio (%)</th>
                    <th style="padding: 12px; border: 1px solid #ccc;">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {#each indicadores as indicador}
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 10px; border: 1px solid #ccc;">{indicador.date}</td>
                        <td style="padding: 10px; border: 1px solid #ccc;">{indicador.region}</td>
                        <td style="padding: 10px; border: 1px solid #ccc;">{indicador.index_name}</td>
                        <td style="padding: 10px; border: 1px solid #ccc;">{indicador.open}</td>
                        <td style="padding: 10px; border: 1px solid #ccc;">{indicador.high}</td>
                        <td style="padding: 10px; border: 1px solid #ccc;">{indicador.low}</td>
                        <td style="padding: 10px; border: 1px solid #ccc;">{indicador.close}</td>
                        <td style="padding: 10px; border: 1px solid #ccc;">{indicador.volume}</td>
                        <td style="padding: 10px; border: 1px solid #ccc;">{indicador.daily_change_percent}</td>
                        <td style="padding: 10px; border: 1px solid #ccc; text-align: center;">
                            <button style="background-color: #ff9800; color: white; border: none; padding: 6px 12px; cursor: pointer; border-radius: 4px;" on:click={() => borrarIndicador(indicador.region, indicador.index_name)}>
                                Eliminar
                            </button>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    {#if indicadores.length === 0}
        <p style="text-align: center; color: #666; margin-top: 20px; font-style: italic;">No hay datos en el sistema. ¡Añade un nuevo registro usando el formulario superior!</p>
    {/if}

</main>