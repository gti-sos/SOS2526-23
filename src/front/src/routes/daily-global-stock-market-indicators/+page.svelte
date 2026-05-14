<script>
    // Importamos onMount para que los datos se carguen automáticamente al entrar en la página
    import { onMount } from 'svelte';

    // Usamos $state (novedad de Svelte 5) para crear variables "reactivas".
    // Esto significa que si cambiamos el valor de estas variables en JavaScript, 
    // el HTML de la página se actualizará automáticamente sin tener que hacer nada más.
    
    // Aquí guardaremos la lista de indicadores que nos devuelva la API
    let indicadores = $state([]);
    
    // Este objeto guarda en tiempo real lo que el usuario va escribiendo en el formulario de "Añadir nuevo registro"
    let nuevoIndicador = $state({
        date: '', index_name: '', region: '', open: '', high: '', 
        low: '', close: '', volume: '', daily_change_percent: ''
    });

    // --- VARIABLES DE BÚSQUEDA Y PAGINACIÓN ---
    // Guarda lo que el usuario escribe en los filtros de arriba del todo.
    // Incluimos limit (cuántos ver) y offset (cuántos saltar) para la paginación.
    let busqueda = $state({
        date: '', region: '', index_name: '', open: '', high: '', low: '', 
        close: '', volume: '', daily_change_percent: '', limit: 10, offset: 0 
    });

    // Variables para controlar las notificaciones (los cartelitos verdes o rojos que salen)
    let mensaje = $state('');
    let esError = $state(false);

    // Función auxiliar para mostrar notificaciones al usuario
    function mostrarMensaje(texto, error = false) {
        mensaje = texto;
        esError = error; // Si es true, el cartel saldrá rojo. Si es false, verde.
        // Programamos un temporizador para que el cartel desaparezca solo a los 5 segundos (5000 ms)
        setTimeout(() => { mensaje = ''; }, 5000);
    }

    // 1. LEER RECURSOS (GET) - Carga la tabla y aplica los filtros si los hay
    async function cargarIndicadores() {
        try {
            // URLSearchParams es una herramienta de JS para construir URLs de búsqueda limpias
            // Ejemplo: pasa de {region: 'Europe'} a "?region=Europe"
            const params = new URLSearchParams();
            
            // Vamos mirando filtro por filtro. Si el usuario ha escrito algo, lo añadimos a la URL.
            if (busqueda.date) params.append('date', busqueda.date);
            if (busqueda.region) params.append('region', busqueda.region);
            if (busqueda.index_name) params.append('index_name', busqueda.index_name);
            if (busqueda.open) params.append('open', busqueda.open);
            if (busqueda.high) params.append('high', busqueda.high);
            if (busqueda.low) params.append('low', busqueda.low);
            if (busqueda.close) params.append('close', busqueda.close);
            if (busqueda.volume) params.append('volume', busqueda.volume);
            if (busqueda.daily_change_percent) params.append('daily_change_percent', busqueda.daily_change_percent);
            
            // Añadimos siempre la paginación
            if (busqueda.limit !== '') params.append('limit', busqueda.limit);
            if (busqueda.offset !== '') params.append('offset', busqueda.offset);

            // Juntamos la ruta de nuestra API con los parámetros que acabamos de construir
            const queryString = params.toString();
            const url = '/api/v1/daily-global-stock-market-indicators' + (queryString ? `?${queryString}` : '');

            // Hacemos la petición GET al backend
            const res = await fetch(url);
            
            if (res.ok) {
                indicadores = await res.json(); // Actualizamos la tabla con los datos que llegan
                
                // Comprobamos si el usuario había escrito algo en los filtros de texto/números
                const hayFiltrosTexto = busqueda.date || busqueda.region || busqueda.index_name || 
                                        busqueda.open || busqueda.high || busqueda.low || 
                                        busqueda.close || busqueda.volume || busqueda.daily_change_percent;
                
                // Si buscó algo pero la API devolvió una lista vacía, le avisamos
                if (indicadores.length === 0 && hayFiltrosTexto) {
                    mostrarMensaje('No se han encontrado datos con esos filtros.', true);
                }
            } else {
                mostrarMensaje('No se pudieron cargar los datos del mercado.', true);
            }
        } catch (error) {
            mostrarMensaje('Error de conexión con el servidor.', true);
        }
    }

    // Botón de "Limpiar Filtros": Vuelve a poner todo en blanco y recarga la tabla
    function limpiarFiltros() {
        busqueda = { 
            date: '', region: '', index_name: '', open: '', high: '', 
            low: '', close: '', volume: '', daily_change_percent: '', 
            limit: 10, offset: 0 
        };
        cargarIndicadores();
    }
  
    // 2. CREAR UN RECURSO (POST) - Añade lo escrito en el formulario a la base de datos
    async function crearIndicador() {
        // Comprobamos si hay algún campo del formulario vacío (Object.values saca todos los valores de nuevoIndicador)
        const camposVacios = Object.values(nuevoIndicador).some(valor => valor === '' || valor === null);
        
        if (camposVacios) {
            mostrarMensaje('Error: Todos los campos son obligatorios. Por favor, rellénalos todos.', true);
            return; // Cortamos la función aquí para que no mande la petición a la API
        }

        try {
            const res = await fetch('/api/v1/daily-global-stock-market-indicators', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoIndicador) // Convertimos el objeto JS a texto JSON para enviarlo
            });

            // Si la API responde 201 (Created), todo ha ido genial
            if (res.status === 201) {
                mostrarMensaje('¡Dato del mercado añadido correctamente!');
                cargarIndicadores(); // Recargamos la tabla para que se vea el nuevo dato
                // Vaciamos el formulario para poder meter otro nuevo
                nuevoIndicador = { date: '', index_name: '', region: '', open: '', high: '', low: '', close: '', volume: '', daily_change_percent: '' };
            } else if (res.status === 409) {
                // 409 (Conflict) - El backend nos dice que ya existe (claves primarias duplicadas)
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

    // 3. BORRAR UN RECURSO (DELETE) - Se ejecuta al pulsar el botón "Eliminar" de una fila
    async function borrarIndicador(region, index_name) {
        try {
            // Mandamos la orden de borrado a la ruta exacta del recurso (combinando región e índice)
            const res = await fetch(`/api/v1/daily-global-stock-market-indicators/${region}/${index_name}`, {
                method: 'DELETE'
            });

            if (res.status === 204 || res.status === 200) { // 204 es "No Content" (borrado con éxito)
                mostrarMensaje('Dato eliminado con éxito.');
                cargarIndicadores(); // Recargamos la tabla para que desaparezca la fila borrada
            } else if (res.status === 404) {
                mostrarMensaje('Error: No se encontró el dato que intentas borrar.', true);
            } else {
                mostrarMensaje('Error al intentar borrar el dato.', true);
            }
        } catch (error) {
            mostrarMensaje('Error de conexión con el servidor.', true);
        }
    }

    // 4. BORRAR TODOS LOS RECURSOS (DELETE) - El botón de peligro rojo
    async function borrarTodos() {
        // Ventana emergente del navegador para evitar borrados por accidente
        if (!confirm('¿Estás seguro de que quieres borrar TODOS los datos de la tabla? Esta acción no se puede deshacer.')) return;

        try {
            const res = await fetch('/api/v1/daily-global-stock-market-indicators', {
                method: 'DELETE'
            });

            if (res.status === 204 || res.status === 200) {
                mostrarMensaje('¡Todos los datos han sido borrados de la base de datos!');
                cargarIndicadores(); // Recargamos la tabla (que ahora estará vacía)
            } else {
                mostrarMensaje('Error al intentar vaciar la base de datos.', true);
            }
        } catch (error) {
            mostrarMensaje('Error de conexión con el servidor.', true);
        }
    }

    // 5. CARGAR DATOS INICIALES - Llama a la API para rellenar la base de datos automáticamente
    async function cargarDatosIniciales() {
        try {
            const res = await fetch('/api/v1/daily-global-stock-market-indicators/loadInitialData');
            
            if (res.ok) {
                mostrarMensaje('¡Datos iniciales cargados correctamente!');
                cargarIndicadores(); // Refrescamos la tabla para ver los datos recién cargados
            } else {
                mostrarMensaje('Error al cargar los datos iniciales.', true);
            }
        } catch (error) {
            mostrarMensaje('Error de conexión con el servidor.', true);
        }
    }

    // Al arrancar la página, llamamos a esta función para que la tabla se llene con lo que haya en la BD
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

    <section style="background-color: #fff9e6; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #ffe082;">
        <h3 style="margin-top: 0;">🔍 Buscar y Filtrar (Múltiples criterios)</h3>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 15px;">
            <input type="text" placeholder="Fecha (ej. 2024)" bind:value={busqueda.date} />
            <input type="text" placeholder="Región (ej. Europe)" bind:value={busqueda.region} />
            <input type="text" placeholder="Índice (ej. DAX)" bind:value={busqueda.index_name} />
            <input type="number" placeholder="Apertura" bind:value={busqueda.open} step="any" />
            <input type="number" placeholder="Máximo" bind:value={busqueda.high} step="any" />
            <input type="number" placeholder="Mínimo" bind:value={busqueda.low} step="any" />
            <input type="number" placeholder="Cierre" bind:value={busqueda.close} step="any" />
            <input type="number" placeholder="Volumen" bind:value={busqueda.volume} />
            <input type="number" placeholder="Cambio (%)" bind:value={busqueda.daily_change_percent} step="any" />
        </div>
        
        <h4 style="margin: 10px 0 5px 0;">Paginación</h4>
        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
            <input type="number" placeholder="Resultados por página" bind:value={busqueda.limit} style="width: 180px;" />
            <input type="number" placeholder="Saltar (Offset)" bind:value={busqueda.offset} style="width: 180px;" />
        </div>

        <div>
            <button style="background-color: #ff9800; color: white; border: none; padding: 8px 15px; cursor: pointer; border-radius: 4px; font-weight: bold; margin-right: 10px;" on:click={cargarIndicadores}>
                Buscar
            </button>
            <button style="background-color: #9e9e9e; color: white; border: none; padding: 8px 15px; cursor: pointer; border-radius: 4px; font-weight: bold;" on:click={limpiarFiltros}>
                Limpiar Filtros
            </button>
        </div>
    </section>

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

    <div style="overflow-x: auto;"> <table style="width: 100%; border-collapse: collapse; text-align: left; min-width: 800px;">
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
                            <a href="/daily-global-stock-market-indicators/{indicador.region}/{indicador.index_name}" style="background-color: #2196F3; color: white; border: none; padding: 6px 12px; cursor: pointer; border-radius: 4px; text-decoration: none; font-size: 13.3333px; display: inline-block; margin-right: 5px;">
                                Editar
                            </a>
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