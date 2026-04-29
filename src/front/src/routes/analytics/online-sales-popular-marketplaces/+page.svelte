<script>
    import Highcharts from 'highcharts';
    import { onMount } from 'svelte';
    import { dev } from '$app/environment';

    let API = '/api/v1/online-sales-popular-marketplaces';
    if (dev) {
        API = 'http://localhost:3000' + API;
    }

    let informationText = $state("");

    // 1. Función para cargar los datos en el backend
    async function loadInitialData() {
        informationText = "Cargando datos en la base de datos...";
        try {
            const res = await fetch(API + "/loadInitialData", { method: "GET" });
            const resultStatusCode = await res.status;
            
            if (resultStatusCode == 200 || resultStatusCode == 409) {
                // Primero dibujamos la gráfica con los nuevos datos
                await getSalesAndRender();
                
                // DESPUÉS ponemos el mensaje de éxito
                if (resultStatusCode == 200) {
                    informationText = "¡Datos cargados con éxito!";
                } else {
                    informationText = "Los datos ya estaban cargados en el sistema.";
                }

                // Hacemos que el mensaje desaparezca a los 3.5 segundos
                setTimeout(() => {
                    informationText = "";
                }, 3500);

            } else {
                informationText = "Error inesperado al cargar los datos iniciales.";
            }
        } catch (error) {
            informationText = "Error de conexión con el servidor.";
        }
    }

    async function getSalesAndRender() {
        try {
            const res = await fetch(API, { method: "GET" });
            if (!res.ok) {
                informationText = "Error al obtener los datos de la API.";
                return;
            }
            
            const apiData = await res.json();
            
            if (apiData.length === 0) {
                informationText = "La base de datos está vacía. Pulsa 'Cargar los datos originales'.";
                document.getElementById('container').innerHTML = '';
                return;
            }

            if (informationText === "Cargando gráfica...") {
                informationText = ""; 
            }

            // 1. OBTENER TODOS LOS MESES (Para que no se salte Junio ni meses vacíos)
            const fechas = apiData.map(item => item.date.substring(0, 7)).sort();
            const minMes = fechas[0];
            const maxMes = fechas[fechas.length - 1];

            const mesesCompletos = [];
            let [year, month] = minMes.split('-').map(Number);
            const [maxYear, maxMonth] = maxMes.split('-').map(Number);

            while (year < maxYear || (year === maxYear && month <= maxMonth)) {
                const mesStr = month.toString().padStart(2, '0');
                mesesCompletos.push(`${year}-${mesStr}`);
                month++;
                if (month > 12) {
                    month = 1;
                    year++;
                }
            }

            // 2. ORDENAR REGIONES POR TAMAÑO (Para que América sea la base y no flote encima)
            const volumenPorRegion = {};
            apiData.forEach(item => {
                if (!volumenPorRegion[item.region]) {
                    volumenPorRegion[item.region] = 0;
                }
                volumenPorRegion[item.region] += item.total;
            });

            // Ordenamos de mayor a menor. La región con más ventas irá en el índice 0 (abajo del stack)
            const regionesUnicas = Object.keys(volumenPorRegion).sort((a, b) => volumenPorRegion[a] - volumenPorRegion[b]);
            // 3. GENERAR LAS SERIES
            const seriesData = regionesUnicas.map(region => {
                const dataPorMes = mesesCompletos.map(mes => {
                    const totalMes = apiData
                        .filter(item => item.region === region && item.date.startsWith(mes))
                        .reduce((suma, item) => suma + item.total, 0);
                    return Math.round(totalMes * 100) / 100;
                });

                return {
                    name: region,
                    data: dataPorMes,
                    fillOpacity: 0.2
                };
            });

            // 4. PINTAR LA GRÁFICA
            Highcharts.chart('container', {
                chart: { type: 'area' },
                title: { text: 'Ingresos Mensuales por Región', align: 'left' },
                xAxis: {
                    categories: mesesCompletos.map(m => {
                        const [y, mth] = m.split('-');
                        const fecha = new Date(y, mth - 1, 1);
                        return fecha.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
                    }),
                    tickmarkPlacement: 'on'
                },
                yAxis: {
                    title: { text: 'Total Ventas ($)' },
                    labels: { format: '${value}' }
                },
                tooltip: {
                    shared: true,
                    headerFormat: '<b>{point.key}</b><br/>',
                    valuePrefix: '$',
                    valueDecimals: 2
                },
                plotOptions: {
                    area: {
                        pointPlacement: 'on',
                        lineColor: '#ffffff',
                        lineWidth: 2,
                        marker: { enabled: true, radius: 4 }
                    }
                },
                series: seriesData
            });
        } catch (error) {
            informationText = "No se pudo conectar con el servidor para pintar la gráfica.";
        }
    }

    onMount(() => {
        informationText = "Cargando gráfica...";
        getSalesAndRender();
    });
</script>

<div class="analytics-container">
    <div class="dashboard-header">
        <h2>Analítica Mensual de Ventas</h2>
        <div class="main-actions">
            <button class="btn btn-primary" onclick={loadInitialData}>Cargar los datos originales</button>
            <a href="/analytics/online-sales-popular-marketplaces/map" class="btn btn-secondary">Ver Mapa de Ventas</a>
        </div>
    </div>
    
    {#if informationText}
        <div class="info-panel">
            <div class="info-message">
                <strong>Información:</strong> {informationText}
            </div>
        </div>
    {/if}

    <div id="container" class="chart-box"></div>
</div>

<style>
    .analytics-container {
        max-width: 1200px;
        margin: 2rem auto;
        padding: 0 20px;
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    }
    .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid #f0f2f5;
    }
    h2 {
        color: #2c3e50;
        margin: 0;
    }
    .main-actions {
        display: flex;
        gap: 10px;
    }
    
    /* Estilos para los botones nativos */
    .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s, opacity 0.2s;
    }
    
    .btn:hover {
        opacity: 0.9;
    }

    .btn-primary {
        background-color: #0d6efd;
        color: white;
    }

    .btn-secondary {
        background-color: #6c757d;
        color: white;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        padding: 8px 16px;
        border-radius: 4px;
        font-weight: 500;
        transition: background-color 0.2s;
    }

    .btn-secondary:hover {
        background-color: #5a6268;
        opacity: 0.9;
    }
    .chart-box {
        width: 100%;
        height: 500px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        padding: 10px;
    }
    .info-panel {
        background-color: #f8faff;
        border-left: 5px solid #2196F3;
        border-radius: 4px;
        padding: 15px 20px;
        margin-bottom: 25px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .info-message {
        font-size: 0.95rem;
        color: #444;
    }
</style>