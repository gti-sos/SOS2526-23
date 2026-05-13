<script>
    import { onMount, tick } from 'svelte';

    // Estados reactivos de Svelte 5
    let cargando = $state(true);
    let errorMensaje = $state("");
    
    // Referencias al DOM y a la instancia de la gráfica
    let canvasElement = $state();
    let chartInstance = null;

    // DICCIONARIO: Clasificamos los países del Banco Mundial en los Continentes de tu API de Ads
    const mapaContinentes = {
        "United States": "North America", "Canada": "North America", "Mexico": "North America",
        "Germany": "Europe", "United Kingdom": "Europe", "France": "Europe", "Spain": "Europe", 
        "Italy": "Europe", "Netherlands": "Europe", "Switzerland": "Europe", "Sweden": "Europe",
        "Poland": "Europe", "Belgium": "Europe", "Norway": "Europe", "Ireland": "Europe",
        "Turkiye": "Europe", "Russian Federation": "Europe", "Greece": "Europe", "Portugal": "Europe",
        "China": "Asia", "Japan": "Asia", "India": "Asia", "Republic of Korea": "Asia", 
        "Indonesia": "Asia", "Saudi Arabia": "Asia", "United Arab Emirates": "Asia", 
        "Singapore": "Asia", "Israel": "Asia", "Philippines": "Asia", "Vietnam": "Asia",
        "Australia": "Oceania", "New Zealand": "Oceania", "Fiji": "Oceania",
        "Brazil": "South America", "Argentina": "South America", "Colombia": "South America",
        "South Africa": "Africa", "Nigeria": "Africa", "Egypt, Arab Rep.": "Africa"
    };

    // Paleta de colores para diferenciar cada continente en el mapa de dispersión
    const paletaColores = [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'
    ];

    onMount(async () => {
        try {
            // Importación dinámica de Chart.js
            const { Chart, registerables } = await import('chart.js');
            Chart.register(...registerables);

            // 1. Tu API de Rendimiento de Anuncios
            const miUrl = 'https://sos2526-23.onrender.com/api/v2/global-ads-performance';
            
            // 2. API del Banco Mundial: PIB per Cápita (2024)
            const wbUrl = 'https://api.worldbank.org/v2/country/all/indicator/NY.GDP.PCAP.CD?format=json&per_page=5000&date=2024';
            
            const [miRespuesta, wbRespuesta] = await Promise.all([
                fetch(miUrl),
                fetch(wbUrl)
            ]);

            if (!miRespuesta.ok) throw new Error("API de Ads falló con código " + miRespuesta.status);
            if (!wbRespuesta.ok) throw new Error("API del Banco Mundial falló con código " + wbRespuesta.status);

            const misDatos = await miRespuesta.json();
            const wbDataBruta = await wbRespuesta.json();
            const susDatos = wbDataBruta[1] || []; 

            // Acumuladores de métricas publicitarias y económicas
            let acumuladorGastoAds = { "Oceania": 0, "North America": 0, "Asia": 0, "Europe": 0, "South America": 0, "Africa": 0, "Resto del mundo": 0 };
            
            // Acumuladores para calcular la media del PIB
            let acumuladorPIB = { "Oceania": 0, "North America": 0, "Asia": 0, "Europe": 0, "South America": 0, "Africa": 0, "Resto del mundo": 0 };
            let contadorPaises = { "Oceania": 0, "North America": 0, "Asia": 0, "Europe": 0, "South America": 0, "Africa": 0, "Resto del mundo": 0 };

            // Procesar GASTO EN ADS
            misDatos.forEach(dato => {
                let region = dato.region || "Resto del mundo";
                if (!acumuladorGastoAds.hasOwnProperty(region)) region = "Resto del mundo";
                acumuladorGastoAds[region] += (Number(dato.ad_spend) || 0);
            });

            // Procesar PIB DEL BANCO MUNDIAL
            susDatos.forEach(item => {
                if (item.value !== null && item.country && item.country.value) {
                    let paisWB = item.country.value;
                    let region = mapaContinentes[paisWB] || "Resto del mundo";
                    acumuladorPIB[region] += item.value;
                    contadorPaises[region] += 1; 
                }
            });

            // Filtramos las regiones que realmente tienen inversión publicitaria
            const categorias = Object.keys(acumuladorGastoAds).filter(reg => acumuladorGastoAds[reg] > 0);
            
            // ===============================================
            // FORMATEO DE DATOS PARA SCATTER (X, Y)
            // ===============================================
            // En un scatter, cada continente es un 'dataset' distinto con una coordenada {x, y}
            const datasetsDispertension = categorias.map((region, index) => {
                const pibMedio = contadorPaises[region] > 0 ? Math.round(acumuladorPIB[region] / contadorPaises[region]) : 0;
                const gastoTotal = Math.round(acumuladorGastoAds[region]);

                return {
                    label: region,
                    data: [{ x: pibMedio, y: gastoTotal }],
                    backgroundColor: paletaColores[index % paletaColores.length],
                    borderColor: 'white',
                    borderWidth: 2,
                    pointRadius: 12,        // Puntos grandes y visuales
                    pointHoverRadius: 16    // Crecen al pasar el ratón
                };
            });

            cargando = false;
            await tick();

            // ===============================================
            // CONSTRUCCIÓN DE LA GRÁFICA SCATTER
            // ===============================================
            if (chartInstance) chartInstance.destroy();

            chartInstance = new Chart(canvasElement, {
                type: 'scatter', // Tipo base: Dispersión
                data: {
                    datasets: datasetsDispertension
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                // Personalizamos el tooltip para que muestre el continente y ambos valores
                                label: function(context) {
                                    const regionNombre = context.dataset.label;
                                    const pib = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(context.parsed.x);
                                    const gasto = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(context.parsed.y);
                                    
                                    // Chart.js permite devolver un array para que el tooltip tenga múltiples líneas
                                    return [
                                        `🌍 Continente: ${regionNombre}`,
                                        `💰 PIB Promedio: ${pib}`,
                                        `💸 Inversión Ads: ${gasto}`
                                    ];
                                }
                            }
                        },
                        legend: {
                            position: 'top',
                            labels: {
                                usePointStyle: true,
                                padding: 20
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: { display: true, text: 'Poder Adquisitivo (PIB per Cápita Promedio)', font: { weight: 'bold', size: 14 } },
                            labels: { format: '${value}' },
                            beginAtZero: true,
                            grid: { color: '#f1f5f9' }
                        },
                        y: {
                            title: { display: true, text: 'Inversión Publicitaria Total (USD)', font: { weight: 'bold', size: 14 } },
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
        🌍 Mapa de Dispersión: Estrategia de Ads vs Poder Adquisitivo (2024)
    </h2>
    
    <p style="color: #475569; line-height: 1.6; font-size: 1.05rem; margin-bottom: 20px;">
        Este <strong>Gráfico de Dispersión (Scatter Plot)</strong> revela correlaciones críticas entre el gasto en <strong>Global Ads Performance</strong> y la riqueza de mercado (PIB per Cápita del <strong>Banco Mundial</strong>). Cada punto representa un continente: cuanto más a la derecha, más rico es el mercado; cuanto más arriba, más presupuesto publicitario recibe.
    </p>

    {#if cargando}
        <div style="text-align: center; padding: 4rem; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
            <p style="font-size: 1.2rem; color: #3b82f6; font-weight: bold; margin: 0;">
                📊 Analizando coordenadas de inversión global...
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