<script>
    import { onMount } from 'svelte';
    // onMount → ejecuta este código solo en el navegador, cuando el componente ya está en pantalla

    // Variables reactivas con Svelte 5 ($state)
    let loading = $state(true);   // Controla si mostramos el mensaje de "cargando..."
    let error = $state(null);     // Si algo falla, guardamos aquí el mensaje de error
    let datos = $state([]);       // Array donde meteremos los repos de GitHub que nos devuelva la API

    onMount(async () => {
        try {
            // 1. Pedimos los datos a nuestro backend, que actúa de intermediario con la API de GitHub
            // (no llamamos a GitHub directamente desde el frontend para no exponer tokens)
            const res = await fetch('/api/v1/integrations/github');
            if (!res.ok) throw new Error('Error ' + res.status); // Si la respuesta no es 2xx, lanzamos error
            datos = await res.json(); // Parseamos el JSON y lo guardamos en la variable reactiva

            // 2. Cargamos ECharts de forma dinámica (lazy import) para evitar problemas de SSR
            const echarts = await import('echarts');

            // Buscamos el div donde pintaremos la gráfica usando su id
            // (aquí usamos querySelector en lugar de bind:this, funciona igual para este caso)
            const chartDom = document.querySelector('#github-chart');
            const chart = echarts.init(chartDom); // Inicializamos ECharts sobre ese div

            // 3. Configuramos la gráfica de radar (tipo tela de araña)
            chart.setOption({
                title: { text: 'Comparativa de frameworks JavaScript en GitHub', left: 'center' },
                tooltip: { trigger: 'axis' }, // El tooltip aparece al pasar el ratón por los ejes
                legend: { top: 30 },           // Leyenda con los nombres de cada framework

                // El radar define los "brazos" de la araña, cada uno con su escala máxima
                radar: {
                    indicator: [
                        { name: 'Stars (k)', max: 250 },  // Máximo 250k estrellas en el eje
                        { name: 'Forks (k)', max: 55 },   // Máximo 55k forks
                        { name: 'Issues', max: 5000 }     // Máximo 5000 issues abiertas
                    ]
                },

                series: [{
                    type: 'radar',
                    // Mapeamos cada repo de nuestra API a un objeto que ECharts entiende
                    data: datos.map(d => ({
                        name: d.name, // Nombre del framework (ej: "react", "vue")
                        value: [
                            Math.round(d.stars / 1000), // Convertimos a miles para que encaje en el eje
                            Math.round(d.forks / 1000), // Igual con los forks
                            d.issues                    // Las issues van directamente, ya están en escala normal
                        ]
                    }))
                }]
            });

        } catch (err) {
            console.error('Error:', err);
            error = err.message; // Guardamos el mensaje para mostrárselo al usuario
        } finally {
            // El bloque finally se ejecuta SIEMPRE, haya error o no
            // Así nos aseguramos de quitar el spinner pase lo que pase
            loading = false;
        }
    });
</script>

<div class="container">
    <h1>GitHub — Comparativa de frameworks JavaScript</h1>
    <p>Comparativa de estrellas, forks e issues de los principales frameworks. Datos obtenidos en tiempo real mediante la API de GitHub.</p>

    <!-- Si hay error mostramos solo el mensaje, sin intentar pintar nada más -->
    {#if error}
        <p class="error">{error}</p>
    {:else}
        <!-- El div de la gráfica siempre está en el DOM (ECharts lo necesita para inicializarse) -->
        <!-- Aunque esté "vacío" visualmente mientras carga, ECharts ya puede apuntar a él -->
        <div id="github-chart" style="width:100%;height:450px;"></div>

        <!-- Mientras cargamos, mostramos texto. Cuando termine, mostramos la tabla -->
        {#if loading}
            <p>Cargando datos de GitHub...</p>
        {:else}
            <!-- Tabla resumen debajo de la gráfica con los datos en formato legible -->
            <table>
                <thead>
                    <tr>
                        <th>Repositorio</th>
                        <th>Lenguaje</th>
                        <th>⭐ Stars</th>
                        <th>🍴 Forks</th>
                        <th>🐛 Issues</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Iteramos sobre cada repo y pintamos una fila por cada uno -->
                    {#each datos as d}
                        <tr>
                            <td>{d.name}</td>
                            <td>{d.language}</td>
                            <!-- toLocaleString() formatea el número con separadores de miles (ej: 1.234.567) -->
                            <td>{d.stars.toLocaleString()}</td>
                            <td>{d.forks.toLocaleString()}</td>
                            <td>{d.issues.toLocaleString()}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {/if}
    {/if}

    <a href="/integrations">← Volver a integraciones</a>
</div>

<style>
    /* Centramos el contenido y limitamos el ancho para que no se estire demasiado en pantallas grandes */
    .container {
        max-width: 900px;
        margin: 2rem auto;
        padding: 1rem;
        font-family: sans-serif;
    }
    h1 { font-size: 1.6rem; margin-bottom: 0.5rem; }
    p { color: #555; margin-bottom: 1.5rem; }

    /* border-collapse: collapse elimina el espacio doble entre bordes de celdas */
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 2rem;
    }
    th, td {
        padding: 0.75rem 1rem;
        text-align: left;
        border-bottom: 1px solid #ddd; /* Línea separadora entre filas */
    }
    th { background: #f5f5f5; font-weight: 600; } /* Cabecera con fondo gris suave */
    .error { color: red; }
    a { display: inline-block; margin-top: 1.5rem; color: #333; }
</style>