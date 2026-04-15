<script>
    import { onMount } from 'svelte';

    // Referencias y estados
    let chartContainer;
    let isLoading = true;
    let errorMessage = "";

    onMount(async () => {
        // 1. Importamos Highcharts dinámicamente (Evita errores SSR en SvelteKit)
        const Highcharts = (await import('highcharts')).default;
        const HC_sankey = (await import('highcharts/modules/sankey')).default;
        const HC_exporting = (await import('highcharts/modules/exporting')).default;

        HC_sankey(Highcharts);
        HC_exporting(Highcharts);

        try {
            // 2. FETCH A TU API (Conectamos con index-DAV.js)
            const response = await fetch('/api/v1/global-ads-performance');
            
            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }

            const rawData = await response.json();

            // Si la base de datos devuelve un array vacío, avisamos al usuario
            if (rawData.length === 0) {
                errorMessage = "No hay datos en la base de datos. Por favor, carga los datos iniciales primero.";
                isLoading = false;
                return;
            }

            // 3. TRANSFORMACIÓN DE DATOS (De JSON plano a Enlaces Sankey)
            const sankeyLinks = {};

            rawData.forEach(row => {
                // Definimos las claves para agrupar
                const link1Key = `${row.platform}_to_${row.industry}`;
                const link2Key = `${row.industry}_to_${row.region}`;

                // Inicializamos si no existen
                if (!sankeyLinks[link1Key]) sankeyLinks[link1Key] = { from: row.platform, to: row.industry, weight: 0 };
                if (!sankeyLinks[link2Key]) sankeyLinks[link2Key] = { from: row.industry, to: row.region, weight: 0 };

                // Sumamos el Revenue (Ingresos)
                // Usamos una pequeña validación por si algún dato viene nulo
                sankeyLinks[link1Key].weight += (row.revenue || 0);
                sankeyLinks[link2Key].weight += (row.revenue || 0);
            });

            // Convertimos el objeto en el array de arrays que necesita Highcharts
            const chartData = Object.values(sankeyLinks).map(link => [link.from, link.to, Math.round(link.weight)]);

            // Ya tenemos los datos, quitamos la pantalla de carga
            isLoading = false;

            // 4. DIBUJAR LA GRÁFICA (Esperamos a que Svelte actualice el DOM para que 'chartContainer' exista)
            setTimeout(() => {
                Highcharts.chart(chartContainer, {
                    chart: {
                        zooming: { type: 'xy' },
                        panning: { enabled: true, type: 'xy' },
                        panKey: 'shift'
                    },
                    title: {
                        text: 'Flujo de Ingresos Publicitarios Globales'
                    },
                    subtitle: {
                        text: 'Source: API Global Ads Performance (DAV)'
                    },
                    accessibility: {
                        point: {
                            valueDescriptionFormat: '{index}. {point.from} to {point.to}, ${point.weight}.'
                        }
                    },
                    tooltip: {
                        headerFormat: null,
                        pointFormat: '<b>{point.fromNode.name} \u2192 {point.toNode.name}</b><br/>Ingresos generados: <b>${point.weight:,.2f}</b>',
                        nodeFormat: 'Total en {point.name}: <b>${point.sum:,.2f}</b>'
                    },
                    series: [{
                        keys: ['from', 'to', 'weight'],
                        data: chartData,
                        type: 'sankey',
                        name: 'Flujo de Ingresos',
                        dataLabels: {
                            style: {
                                color: '#000000',
                                textOutline: 'none',
                                fontWeight: 'bold'
                            }
                        }
                    }]
                });
            }, 0);

        } catch (error) {
            console.error("Error al cargar la gráfica:", error);
            errorMessage = "No se pudieron cargar los datos de la API. ¿Está el servidor backend encendido?";
            isLoading = false;
        }
    });
</script>

<svelte:head>
    <title>Analytics DAV - Global Ads Performance</title>
</svelte:head>

<main class="container">
    <h1>Analytics: Global Ads Performance (DAV)</h1>
    
    <div class="info-text">
        <p>Esta gráfica Sankey muestra el flujo económico de las campañas publicitarias.</p>
        <p>Lee los datos en tiempo real de <code>/api/v1/global-ads-performance</code> y agrupa el volumen de <strong>Ingresos (Revenue)</strong> fluyendo desde la <strong>Plataforma</strong> de origen, pasando por la <strong>Industria</strong>, hasta la <strong>Región</strong> final.</p>
    </div>

    {#if isLoading}
        <div class="status-box loading">
            <p>⏳ Cargando datos desde la API...</p>
        </div>
    {:else if errorMessage}
        <div class="status-box error">
            <p>❌ {errorMessage}</p>
        </div>
    {:else}
        <div bind:this={chartContainer} class="highcharts-container"></div>
    {/if}

    <div class="back-button">
        <a href="/" class="btn-home">&larr; Volver a Inicio</a>
    </div>
</main>

<style>
    /* Estilos base consistentes con tu página principal */
    :global(body) {
        font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background-color: #f4f7f6;
        color: #333;
        margin: 0;
        padding: 0;
    }

    .container {
        max-width: 1000px; /* Un poco más ancho que la home para que la gráfica respire */
        margin: 40px auto;
        padding: 40px;
        background-color: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    h1 {
        text-align: center;
        color: #1a202c;
        margin-top: 0;
        padding-bottom: 15px;
        border-bottom: 2px solid #edf2f7;
    }

    .info-text {
        text-align: center;
        margin-bottom: 30px;
        color: #4a5568;
    }

    .highcharts-container {
        width: 100%;
        height: 650px; /* Altura ideal para Sankey */
        margin: 0 auto;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 10px;
        box-sizing: border-box;
    }

    .status-box {
        text-align: center;
        padding: 40px;
        border-radius: 8px;
        font-size: 1.2rem;
        font-weight: 500;
        margin: 40px 0;
    }

    .loading {
        background-color: #ebf4ff;
        color: #007bff;
        border: 1px solid #bfdbfe;
    }

    .error {
        background-color: #fef2f2;
        color: #dc2626;
        border: 1px solid #fecaca;
    }

    .back-button {
        margin-top: 30px;
        text-align: center;
    }

    .btn-home {
        display: inline-block;
        padding: 10px 20px;
        background-color: #4a5568;
        color: white;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 500;
        transition: background-color 0.2s;
    }

    .btn-home:hover {
        background-color: #2d3748;
    }
</style>