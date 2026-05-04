<script>
    import { onMount } from 'svelte';
    import Highcharts from 'highcharts';

    // Estado reactivo en Svelte 5
    let cargando = $state(true);
    let errorMensaje = $state("");
    let chartContainer = $state();

    // Arrays para alimentar el gráfico Spline
    let categorias = $state([]);
    let dataAds = $state([]);
    let dataAlcohol = $state([]);

    const mapaRegiones = {
        "USA": "North America", "Canada": "North America", "Mexico": "North America",
        "Switzerland": "Europe", "Russia": "Europe", "Sweden": "Europe", "France": "Europe",
        "Germany": "Europe", "United Kingdom": "Europe", "Spain": "Europe", "Italy": "Europe",
        "Romania": "Europe", "Bulgaria": "Europe", "Norway": "Europe", "Netherlands": "Europe",
        "Austria": "Europe", "Denmark": "Europe", "Albania": "Europe", "Greece": "Europe",
        "Czechia": "Europe", "Portugal": "Europe", "Belgium": "Europe", "Georgia": "Europe",
        "China": "Asia", "South Korea": "Asia", "Syrian Arab Republic": "Asia", "Oman": "Asia",
        "Japan": "Asia", "Philippines": "Asia", "Turkey": "Europe", "India": "Asia",
        "Australia": "Oceania", "New Zealand": "Oceania",
        "Chile": "Resto del mundo", "Argentina": "Resto del mundo", "Uruguay": "Resto del mundo",
        "Peru": "Resto del mundo", "Colombia": "Resto del mundo", "Brazil": "Resto del mundo",
        "Libya": "Resto del mundo", "South Africa": "Resto del mundo", "Morocco": "Resto del mundo",
        "Algeria": "Resto del mundo", "Namibia": "Resto del mundo", "Nigeria": "Resto del mundo", 
        "Egypt": "Resto del mundo", "Antarctica": "Resto del mundo"
    };

    onMount(async () => {
        try {
            const miUrl = 'https://sos2526-23.onrender.com/api/v2/global-ads-performance';
            const suUrl = 'https://sos2526-25.onrender.com/api/v2/social-drinking-behaviors';
            
            const [miRespuesta, suRespuesta] = await Promise.all([
                fetch(miUrl),
                fetch(suUrl)
            ]);

            if (!miRespuesta.ok) throw new Error("Mi API (Ads) falló.");
            if (!suRespuesta.ok) throw new Error("La API de bebidas falló.");

            const misDatos = await miRespuesta.json();
            const susDatos = await suRespuesta.json();

            let statsAds = {};
            let statsAlcohol = {};

            // 1. Procesar API de Ads
            misDatos.forEach(dato => {
                let region = dato.region || "Resto del mundo";
                if (!statsAds[region]) statsAds[region] = 0;
                statsAds[region] += (Number(dato.ad_spend) || 0);
            });

            // 2. Procesar API de Alcohol (para sacar el promedio)
            susDatos.forEach(dato => {
                let region = mapaRegiones[dato.country] || "Resto del mundo";
                if (!statsAlcohol[region]) statsAlcohol[region] = { suma_litros: 0, count: 0 };
                
                statsAlcohol[region].suma_litros += (Number(dato.total_liter) || 0);
                statsAlcohol[region].count += 1;
            });

            // 3. Generar los arrays ordenados para el eje X (Categorías) y las series
            let regionesComunes = Object.keys(statsAds);
            let tempCat = [];
            let tempAds = [];
            let tempAlc = [];

            regionesComunes.forEach(reg => {
                let gasto = statsAds[reg];
                let avgLitros = statsAlcohol[reg] ? (statsAlcohol[reg].suma_litros / statsAlcohol[reg].count) : 0;

                tempCat.push(reg);
                tempAds.push(Math.round(gasto));
                tempAlc.push(Number(avgLitros.toFixed(2))); // Redondeamos a 2 decimales
            });

            categorias = tempCat;
            dataAds = tempAds;
            dataAlcohol = tempAlc;

            cargando = false;

        } catch (error) {
            console.error("Error:", error);
            errorMensaje = error.message;
            cargando = false;
        }
    });

    $effect(() => {
        if (!cargando && !errorMensaje && chartContainer) {
            const colors = Highcharts.getOptions().colors;

            Highcharts.chart(chartContainer, {
                chart: {
                    type: 'spline'
                },
                title: {
                    text: 'Tendencia Regional: Gasto en Ads vs Consumo de Alcohol',
                    align: 'left'
                },
                subtitle: {
                    text: 'Integración de APIs SOS2526-23 y SOS2526-25',
                    align: 'left'
                },
                xAxis: {
                    categories: categorias,
                    title: { text: 'Regiones Globales' },
                    crosshair: true
                },
                // Configuramos el DOBLE EJE Y
                yAxis: [{ 
                    title: { text: 'Gasto en Ads (USD)' },
                    labels: { format: '${value}' }
                }, { 
                    title: { text: 'Consumo Promedio (Litros)' },
                    labels: { format: '{value} L' },
                    opposite: true // Lo manda a la derecha
                }],
                tooltip: {
                    shared: true,
                    stickOnContact: true
                },
                plotOptions: {
                    series: {
                        cursor: 'pointer',
                        lineWidth: 2,
                        marker: {
                            symbol: 'circle'
                        }
                    }
                },
                series: [
                    {
                        name: 'Gasto en Ads',
                        data: dataAds,
                        yAxis: 0, // Se ata al eje izquierdo
                        color: colors[0],
                        tooltip: { valuePrefix: '$' }
                    }, 
                    {
                        name: 'Consumo de Alcohol',
                        data: dataAlcohol,
                        yAxis: 1, // Se ata al eje derecho
                        dashStyle: 'ShortDashDot', // El estilo punteado que pediste
                        color: colors[2],
                        tooltip: { valueSuffix: ' Litros' }
                    }
                ],
                responsive: {
                    rules: [{
                        condition: {
                            maxWidth: 550
                        },
                        chartOptions: {
                            legend: {
                                itemWidth: 150
                            },
                            xAxis: {
                                title: { text: '' }
                            },
                            yAxis: [{
                                visible: false
                            }, {
                                visible: false
                            }]
                        }
                    }]
                }
            });
        }
    });
</script>

<main style="padding: 2rem; max-width: 1000px; margin: 0 auto;">
    {#if cargando}
        <div style="text-align: center; padding: 3rem;">
            <p>Procesando datos y dibujando líneas...</p>
        </div>
    {:else if errorMensaje}
        <div style="background-color: #fee2e2; color: #991b1b; padding: 1rem; border-radius: 8px;">
            <p><strong>Error:</strong> {errorMensaje}</p>
        </div>
    {:else}
        <div bind:this={chartContainer} style="width: 100%; height: 500px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 1rem;"></div>
    {/if}
</main>