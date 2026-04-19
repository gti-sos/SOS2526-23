<script>
    import { onMount } from 'svelte';

    let chartContainer;
    let isLoading = $state(true);
    let errorMessage = $state("");

    onMount(async () => {
        try {
            // Importaciones seguras para SvelteKit/Vite
            const hcMaps = await import('highcharts/highmaps');
            const Highcharts = hcMaps.default || hcMaps;
            
            const hcExport = await import('highcharts/modules/exporting');
            const HC_exporting = typeof hcExport === 'function' ? hcExport : (hcExport.default || null);
            
            // Solo lo ejecutamos si realmente existe la función
            if (typeof HC_exporting === 'function') {
                HC_exporting(Highcharts);
            }

            // 3. Fetch de la topología (El mapa base)
            const topology = await fetch('https://code.highcharts.com/mapdata/custom/world.topo.json')
                                    .then(response => response.json());

            // 4. Fetch de tus datos desde la API
            const response = await fetch('/api/v1/global-ads-performance');
            if (!response.ok) throw new Error("Error al cargar la API");
            const rawData = await response.json();

            // 5. Lógica de agrupación por región
            const regionTotals = { "Asia": 0, "Europe": 0, "North America": 0 };
            
            rawData.forEach(item => {
                if (regionTotals[item.region] !== undefined) {
                    regionTotals[item.region] += item.revenue || 0;
                }
            });

            // 6. Traductor de continentes a países
            const countryMapping = {
                "North America": ['USA', 'CAN', 'MEX', 'CUB', 'GTM', 'HND', 'PAN', 'CRI', 'DOM'],
                "Europe": ['GBR', 'FRA', 'DEU', 'ITA', 'ESP', 'POL', 'NLD', 'BEL', 'SWE', 'NOR', 'FIN', 'DNK', 'PRT', 'GRC', 'CHE', 'AUT', 'CZE', 'ROU', 'UKR', 'BLR', 'RUS', 'IRL', 'HUN'],
                "Asia": ['CHN', 'IND', 'JPN', 'KOR', 'IDN', 'PAK', 'BGD', 'PHL', 'VNM', 'TUR', 'IRN', 'THA', 'SAU', 'MYS', 'ARE', 'ISR', 'SGP', 'IRQ', 'AFG', 'KAZ']
            };

            const mapData = [];

            Object.keys(regionTotals).forEach(region => {
                const totalRevenue = regionTotals[region];
                const countriesInRegion = countryMapping[region] || [];
                
                countriesInRegion.forEach(countryCode => {
                    mapData.push({
                        code: countryCode,
                        value: totalRevenue,
                        regionName: region 
                    });
                });
            });

            // Al usar Svelte 5, cambiar esto actualiza el DOM automáticamente e instantáneamente
            isLoading = false;

            // 7. Dibujar el mapa
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
                            return `<b>${this.point.name}</b> (${this.point.regionName})<br/>` +
                                   `Ingresos de la región: <b>$${this.point.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>`;
                        }
                    },
                    series: [{
                        name: 'Ingresos por Región',
                        data: mapData,
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