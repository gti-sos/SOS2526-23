<script>
    import { onMount } from 'svelte';

    let chartContainer;
    
    // ARGUMENTO DE DEFENSA: Svelte 5 (Runas).
    // Usamos $state() para declarar variables reactivas. Esto demuestra que el proyecto
    // está al día con la última versión de Svelte, optimizando el rendimiento y 
    // haciendo que el estado sea más predecible que con la reactividad tradicional de Svelte 3/4.
    let isLoading = $state(true);
    let errorMessage = $state("");

    onMount(async () => {
        try {
            // 1. IMPORTACIONES SEGURAS Y LAZY LOADING
            // ARGUMENTO DE DEFENSA: Al igual que en la gráfica Sankey, importamos Highmaps 
            // de forma dinámica. Esto evita que la librería rompa el Server-Side Rendering (SSR) 
            // de SvelteKit y reduce el peso del bundle inicial (la página carga más rápido).
            const hcMaps = await import('highcharts/highmaps');
            const Highcharts = hcMaps.default || hcMaps;
            
            // Módulo de exportación (Permite al usuario descargar el mapa en PNG/PDF)
            const hcExport = await import('highcharts/modules/exporting');
            const HC_exporting = typeof hcExport === 'function' ? hcExport : (hcExport.default || null);
            
            // Solo lo ejecutamos si realmente existe la función (manejo robusto de errores de módulos)
            if (typeof HC_exporting === 'function') {
                HC_exporting(Highcharts);
            }

            // 3. FETCH DE LA TOPOLOGÍA (El mapa base)
            // ARGUMENTO DE DEFENSA: Consumo de APIs de terceros. 
            // En lugar de guardar un archivo GeoJSON gigante en nuestro proyecto, 
            // consumimos la topología mundial oficial de Highcharts en tiempo real.
            const topology = await fetch('https://code.highcharts.com/mapdata/custom/world.topo.json')
                                    .then(response => response.json());

            // 4. FETCH DE TUS DATOS DESDE LA API (Nuestra API interna)
            const response = await fetch('/api/v1/global-ads-performance');
            if (!response.ok) throw new Error("Error al cargar la API");
            const rawData = await response.json();

            // 5. LÓGICA DE AGRUPACIÓN POR REGIÓN
            // Inicializamos un acumulador para sumar los ingresos ('revenue') de cada región.
            const regionTotals = { "Asia": 0, "Europe": 0, "North America": 0 };
            
            rawData.forEach(item => {
                if (regionTotals[item.region] !== undefined) {
                    regionTotals[item.region] += item.revenue || 0;
                }
            });

            // 6. TRADUCTOR DE CONTINENTES A PAÍSES (El corazón de este script)
            // ARGUMENTO DE DEFENSA: Adaptación de Granularidad de Datos.
            // Nuestra API agrupa los datos por macro-regiones ("Europe", "Asia"). Sin embargo, 
            // un mapa interactivo Choropleth necesita iluminar "Países" específicos usando 
            // códigos estándar ISO-A3 (ej. 'ESP' para España). 
            // Implementamos este diccionario para "proyectar" el valor de la región entera 
            // sobre todos los países que la componen en el mapa visual.
            const countryMapping = {
                "North America": ['USA', 'CAN', 'MEX', 'CUB', 'GTM', 'HND', 'PAN', 'CRI', 'DOM'],
                "Europe": ['GBR', 'FRA', 'DEU', 'ITA', 'ESP', 'POL', 'NLD', 'BEL', 'SWE', 'NOR', 'FIN', 'DNK', 'PRT', 'GRC', 'CHE', 'AUT', 'CZE', 'ROU', 'UKR', 'BLR', 'RUS', 'IRL', 'HUN'],
                "Asia": ['CHN', 'IND', 'JPN', 'KOR', 'IDN', 'PAK', 'BGD', 'PHL', 'VNM', 'TUR', 'IRN', 'THA', 'SAU', 'MYS', 'ARE', 'ISR', 'SGP', 'IRQ', 'AFG', 'KAZ']
            };

            const mapData = [];

            // Aplanamos el objeto bidimensional en un array de objetos para Highcharts
            Object.keys(regionTotals).forEach(region => {
                const totalRevenue = regionTotals[region];
                const countriesInRegion = countryMapping[region] || [];
                
                countriesInRegion.forEach(countryCode => {
                    mapData.push({
                        code: countryCode, // El código ISO que lee el mapa
                        value: totalRevenue, // El color dependerá de este valor
                        regionName: region // Guardamos el nombre original para mostrarlo en el Tooltip
                    });
                });
            });

            // Al usar Svelte 5, cambiar esto actualiza el DOM automáticamente e instantáneamente.
            // Oculta el cartel de "Cargando..." y muestra el <div> del mapa.
            isLoading = false;

            // 7. DIBUJAR EL MAPA
            // ARGUMENTO DE DEFENSA: Sincronización del DOM (El porqué del setTimeout a 0).
            // Al poner isLoading a 'false', Svelte inyecta el 'chartContainer' en el HTML.
            // Si llamamos a Highcharts.mapChart inmediatamente, podría intentar pintar en un div 
            // que aún no existe físicamente en el DOM. El setTimeout(..., 0) empuja el renderizado 
            // del mapa al final de la cola de eventos (Event Loop), asegurando que el div ya esté listo.
            setTimeout(() => {
                Highcharts.mapChart(chartContainer, {
                    chart: {
                        map: topology
                    },
                    title: {
                        text: 'Ingresos Publicitarios Globales (Revenue)',
                        align: 'left'
                    },
                    subtitle: {
                        text: 'Datos agrupados por región. Source: API Global Ads Performance',
                        align: 'left'
                    },
                    mapNavigation: {
                        enabled: true,
                        buttonOptions: {
                            verticalAlign: 'bottom'
                        }
                    },
                    // ARGUMENTO DE DEFENSA: Escala de colores (Choropleth).
                    // Configuramos un eje de color lineal que va del blanco/celeste al azul oscuro
                    // dependiendo del 'value' inyectado antes, permitiendo ver de un vistazo 
                    // qué región genera más ingresos.
                    colorAxis: {
                        min: 0,
                        type: 'linear',
                        stops: [
                            [0, '#EFEFFF'],
                            [0.5, '#4444FF'],
                            [1, '#000022']
                        ]
                    },
                    tooltip: {
                        formatter: function () {
                            // Interpolación de strings limpia y formateo local de moneda
                            return `<b>${this.point.name}</b> (${this.point.regionName})<br/>` +
                                   `Ingresos de la región: <b>$${this.point.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>`;
                        }
                    },
                    series: [{
                        name: 'Ingresos por Región',
                        data: mapData,
                        // 'joinBy' es crucial: Enlaza nuestra propiedad 'code' con la propiedad 'iso-a3' del mapa topológico
                        joinBy: ['iso-a3', 'code'], 
                        dataLabels: {
                            enabled: true,
                            format: '{point.name}',
                            filter: {
                                operator: '>',
                                property: 'labelrank',
                                value: 250
                            },
                            style: {
                                fontWeight: 'normal',
                                textOutline: 'none'
                            }
                        }
                    }]
                });
            }, 0);

        } catch (error) {
            console.error(error);
            errorMessage = "No se pudieron cargar los datos para el mapa.";
            isLoading = false; // Svelte 5 mostrará el bloque de error inmediatamente
        }
    });
</script>

<main class="container">
    {#if isLoading}
        <div class="status-box loading">
            <p>🌍 Cargando mapa interactivo...</p>
        </div>
    {:else if errorMessage}
        <div class="status-box error">
            <p>❌ {errorMessage}</p>
        </div>
    {:else}
        <div bind:this={chartContainer} class="map-container"></div>
    {/if}

    <div class="back-button">
        <a href="/analytics/global-ads-performance" class="btn-home">&larr; Volver a la Gráfica Sankey</a>
    </div>
</main>

<style>
    .container {
        max-width: 1000px;
        margin: 40px auto;
        padding: 40px;
        background-color: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .map-container {
        width: 100%;
        height: 600px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
    }

    .status-box {
        text-align: center;
        padding: 40px;
        border-radius: 8px;
        font-size: 1.2rem;
        font-weight: 500;
        margin: 40px 0;
    }

    .loading { background-color: #ebf4ff; color: #007bff; border: 1px solid #bfdbfe; }
    .error { background-color: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

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
        transition: background-color 0.2s;
    }

    .btn-home:hover { background-color: #2d3748; }
</style>