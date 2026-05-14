<script>
    import { onMount, tick } from 'svelte';

    // Estados reactivos de Svelte 5
    let cargando = $state(true);
    let errorMensaje = $state("");
    
    // Referencias al DOM y a la instancia de la gráfica
    let canvasElement = $state();
    let chartInstance = null;

    // DICCIONARIO: Clasificamos los países del Banco Mundial en los continentes de tu API
    const mapaContinentes = {
        "United States": "North America", "Canada": "North America", "Mexico": "North America",
        "Germany": "Europe", "United Kingdom": "Europe", "France": "Europe", "Spain": "Europe", 
        "Italy": "Europe", "Netherlands": "Europe", "Switzerland": "Europe", "Sweden": "Europe",
        "China": "Asia", "Japan": "Asia", "India": "Asia", "Republic of Korea": "Asia", 
        "Indonesia": "Asia", "Saudi Arabia": "Asia", "United Arab Emirates": "Asia",
        "Australia": "Oceania", "New Zealand": "Oceania",
        "Brazil": "South America", "Argentina": "South America", "Colombia": "South America",
        "South Africa": "Africa", "Nigeria": "Africa", "Egypt, Arab Rep.": "Africa"
    };

    // Paleta de colores para diferenciar cada continente
    const paletaColores = [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'
    ];

    onMount(async () => {
        try {
            // Importación dinámica de Chart.js
            const { Chart, registerables } = await import('chart.js');
            Chart.register(...registerables);

            // 1. Tu API (Asegúrate de que esta URL es correcta en tu servidor de Render o usa la ruta relativa '/api/v1/...')
            const miUrl = 'https://sos2526-23.onrender.com/api/v1/online-sales-popular-marketplaces';
            
            // 2. API Externa (Banco Mundial): Uso de Internet (% de población) - Usamos 2022 porque es el año más reciente con datos globales completos
            const wbUrl = 'https://api.worldbank.org/v2/country/all/indicator/IT.NET.USER.ZS?format=json&per_page=5000&date=2022';
            
            const [miRespuesta, wbRespuesta] = await Promise.all([
                fetch(miUrl),
                fetch(wbUrl)
            ]);

            if (!miRespuesta.ok) throw new Error("Tu API de Ventas falló con código " + miRespuesta.status);
            if (!wbRespuesta.ok) throw new Error("API del Banco Mundial falló con código " + wbRespuesta.status);

            const misDatos = await miRespuesta.json();
            const wbDataBruta = await wbRespuesta.json();
            const susDatos = wbDataBruta[1] || []; 

            // Acumuladores de Ventas (Tu API) e Internet (Banco Mundial)
            let ventasPorRegion = { "Oceania": 0, "North America": 0, "Asia": 0, "Europe": 0, "South America": 0, "Africa": 0 };
            let internetPorRegion = { "Oceania": 0, "North America": 0, "Asia": 0, "Europe": 0, "South America": 0, "Africa": 0 };
            let contadoresPaises = { "Oceania": 0, "North America": 0, "Asia": 0, "Europe": 0, "South America": 0, "Africa": 0 };

            // 1. Procesar TUS DATOS (Sumar el 'total' de ingresos por 'region')
            misDatos.forEach(dato => {
                let region = dato.region;
                if (ventasPorRegion[region] !== undefined) {
                    ventasPorRegion[region] += (Number(dato.total) || 0);
                }
            });

            // 2. Procesar DATOS EXTERNOS (Calcular media de penetración de Internet por región)
            susDatos.forEach(item => {
                if (item.value !== null && item.country && item.country.value) {
                    let paisWB = item.country.value;
                    let region = mapaContinentes[paisWB];
                    if (region && internetPorRegion[region] !== undefined) {
                        internetPorRegion[region] += item.value;
                        contadoresPaises[region] += 1; 
                    }
                }
            });

            // Filtramos solo las regiones donde realmente has tenido ventas en tu API
            const regionesActivas = Object.keys(ventasPorRegion).filter(reg => ventasPorRegion[reg] > 0);
            
            // ===============================================
            // FORMATEO DE DATOS PARA SCATTER (X = Internet %, Y = Ingresos $)
            // ===============================================
            const datasetsDispertension = regionesActivas.map((region, index) => {
                const internetMedio = contadoresPaises[region] > 0 
                    ? (internetPorRegion[region] / contadoresPaises[region]).toFixed(1) 
                    : 0;
                const ventasTotales = ventasPorRegion[region].toFixed(2);

                return {
                    label: region,
                    data: [{ x: Number(internetMedio), y: Number(ventasTotales) }],
                    backgroundColor: paletaColores[index % paletaColores.length],
                    borderColor: 'white',
                    borderWidth: 2,
                    pointRadius: 15,        // Puntos grandes y visuales
                    pointHoverRadius: 20    // Crecen al pasar el ratón
                };
            });

            cargando = false;
            await tick();

            // ===============================================
            // CONSTRUCCIÓN DE LA GRÁFICA SCATTER
            // ===============================================
            if (chartInstance) chartInstance.destroy();

            chartInstance = new Chart(canvasElement, {
                type: 'scatter',
                data: {
                    datasets: datasetsDispertension
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const regionNombre = context.dataset.label;
                                    const internet = context.parsed.x + "%";
                                    const ingresos = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                                    
                                    return [
                                        `🌍 Región: ${regionNombre}`,
                                        `🌐 Usuarios de Internet: ${internet}`,
                                        `💰 Ingresos Totales: ${ingresos}`
                                    ];
                                }
                            }
                        },
                        legend: {
                            position: 'top',
                            labels: { usePointStyle: true, padding: 20, font: { size: 13 } }
                        }
                    },
                    scales: {
                        x: {
                            title: { display: true, text: 'Penetración de Internet (% de la población)', font: { weight: 'bold', size: 14 } },
                            labels: { format: '{value}%' },
                            beginAtZero: false,
                            grid: { color: '#f1f5f9' }
                        },
                        y: {
                            title: { display: true, text: 'Ingresos por Ventas Online (USD)', font: { weight: 'bold', size: 14 } },
                            labels: { format: '${value}' },
                            beginAtZero: true,
                            grid: { color: '#f1f5f9' }
                        }
                    }
                }
            });

        } catch (error) {
            console.error("Error en la integración:", error);
            errorMensaje = error.message;
            cargando = false;
        }
    });
</script>

<main style="padding: 2rem; max-width: 1200px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <h2 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
        🛒 Ventas Regionales vs 🌐 Conectividad Digital
    </h2>
    
    <p style="color: #475569; line-height: 1.6; font-size: 1.05rem; margin-bottom: 20px;">
        Este gráfico de dispersión cruza nuestros ingresos totales por región (obtenidos de la API de Ventas Online) con el porcentaje de población que utiliza internet en dichas regiones (datos de la API pública del Banco Mundial). Nos permite analizar si un mayor acceso digital se traduce directamente en un mayor volumen de ventas para nuestro comercio.
    </p>

    {#if cargando}
        <div style="text-align: center; padding: 4rem; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
            <p style="font-size: 1.2rem; color: #3b82f6; font-weight: bold; margin: 0;">
                📊 Analizando coordenadas e importando datos globales...
            </p>
        </div>
    {:else if errorMensaje}
        <div style="background-color: #fee2e2; border: 1px solid #ef4444; color: #b91c1c; padding: 20px; border-radius: 8px; font-weight: 500;">
            ❌ <strong>Error de conexión:</strong> {errorMensaje}
        </div>
    {:else}
        <div style="width: 100%; height: 550px; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; background-color: white; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
            <canvas bind:this={canvasElement}></canvas>
        </div>
    {/if}
</main>