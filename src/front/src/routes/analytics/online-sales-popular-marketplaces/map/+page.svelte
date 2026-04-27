<script>
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';

    import Highcharts from 'highcharts/highmaps';

    let chartContainer;
    let informationText = $state("Cargando mapa de regiones...");

    const API = '/api/v1/online-sales-popular-marketplaces';

    // Mapeo de tus nombres de región a los códigos que usa el mapa de continentes
    const regionKeys = {
        "North America": "na",
        "South America": "sa",
        "Europe": "eu",
        "Asia": "as",
        "Africa": "af",
        "Oceania": "oc"
    };

    onMount(async () => {
        if (!browser) return;

        try {
            // 1. Cargamos el mapa de CONTINENTES en lugar del de países
            const topoRes = await fetch('https://code.highcharts.com/mapdata/custom/world-continents.topo.json');
            const topology = await topoRes.json();

            // 2. Fetch de tus datos
            const res = await fetch(API);
            if (!res.ok) throw new Error("Error al obtener los datos de la API");
            const sales = await res.json();

            if (sales.length === 0) {
                informationText = "No hay datos disponibles.";
                return;
            }

            // 3. Procesar datos para sumar totales por región
            let regionTotals = {};
            sales.forEach(sale => {
                const key = regionKeys[sale.region];
                if (key) {
                    regionTotals[key] = (regionTotals[key] || 0) + sale.total;
                }
            });

            // 4. Convertir al formato que entiende Highcharts para colorear (hc-key + value)
            const mapData = Object.keys(regionTotals).map(key => ({
                "hc-key": key,
                "value": Math.round(regionTotals[key])
            }));

            informationText = ""; 

            // 5. Configurar el mapa de Coropletas
            Highcharts.mapChart(chartContainer, {
                chart: { map: topology },
                title: { text: 'Distribución Global de Ventas por Región' },
                
                // El colorAxis es lo que define el degradado de colores
                colorAxis: {
                    min: 0,
                    minColor: '#E6E7E8',
                    maxColor: '#003399', 
                },

                tooltip: {
                    headerFormat: '',
                    pointFormat: '<b>Región: {point.name}</b><br>Ventas Totales: <b>${point.value}</b>'
                },

                series: [{
                    data: mapData,
                    name: 'Ventas por Región',
                    states: {
                        hover: {
                            color: '#BADA55' // Color que resalta al pasar el ratón
                        }
                    },
                    dataLabels: {
                        enabled: true,
                        format: '{point.name}' // Muestra el nombre de la región encima
                    }
                }]
            });

        } catch (err) {
            console.error(err);
            informationText = "Error al cargar el mapa: " + err.message;
        }
    });
</script>

<div class="map-container">
    {#if informationText !== ""}
        <div class="alert {informationText.includes('Error') ? 'error' : 'info'}">
            {informationText}
        </div>
    {/if}

    <div class="back-button">
        <a href="/analytics/online-sales-popular-marketplaces" class="btn-home">&larr; Volver a la gráfica </a>
    </div>

    <div class="card">
        <div bind:this={chartContainer} style="width: 100%; height: 600px;"></div>
    </div>
</div>

<style>
    .map-container {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
    }
    .card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        padding: 10px;
        overflow: hidden;
    }
    .alert {
        padding: 15px;
        margin-bottom: 20px;
        border-radius: 8px;
        font-weight: bold;
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
        transition: background-color 0.2s;
    }
    .btn-home:hover { background-color: #2d3748; }
    .info { background: #e3f2fd; color: #1976d2; border-left: 5px solid #1976d2; }
    .error { background: #ffebee; color: #c62828; border-left: 5px solid #c62828; }
</style>