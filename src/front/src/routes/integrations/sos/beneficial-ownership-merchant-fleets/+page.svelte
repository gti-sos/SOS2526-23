<script>
    import { onMount } from 'svelte';
    import Highcharts from 'highcharts';

    // Estado reactivo en Svelte 5
    let cargando = $state(true);
    let errorMensaje = $state("");
    
    let categorias = $state([]);
    let dataMiGasto = $state([]);
    let dataSusBarcos = $state([]);

    // Referencia al contenedor del DOM para Highcharts
    let chartContainer = $state();

    const mapaRegiones = {
        "Singapore": "Asia", "Switzerland": "Europe", "Greenland": "North America", 
        "Bangladesh": "Asia", "Poland": "Europe", "Canada": "North America",
        "Estonia": "Europe", "Iceland": "Europe", "Germany": "Europe", 
        "Syrian Arab Republic": "Asia", "Spain": "Europe", "Greece": "Europe",
        "Cyprus": "Europe", "United Arab Emirates": "Asia", "Denmark": "Europe", 
        "Lithuania": "Europe", "China": "Asia", "China, Hong Kong SAR": "Asia", 
        "Indonesia": "Asia", "United Kingdom": "Europe", "Russian Federation": "Europe",
        "Latvia": "Europe", "Turkiye": "Europe", "Ukraine": "Europe", 
        "Bahamas": "North America", "Republic of Korea": "Asia", "Norway": "Europe",
        "Belgium": "Europe", "France": "Europe", "Italy": "Europe", 
        "China, Taiwan Province of": "Asia", "Australia": "Oceania", 
        "Finland": "Europe", "Ireland": "Europe", "Albania": "Europe", 
        "Portugal": "Europe", "Philippines": "Asia", 
        "Netherlands (Kingdom of the)": "Europe", "China, Macao SAR": "Asia"
    };

    onMount(async () => {
        try {
            const miUrl = 'https://sos2526-23.onrender.com/api/v2/global-ads-performance';
            const suUrl = 'https://sos2526-28.onrender.com/api/v2/beneficial-ownership-merchant-fleets';
            
            const [miRespuesta, suRespuesta] = await Promise.all([
                fetch(miUrl),
                fetch(suUrl)
            ]);

            if (!miRespuesta.ok) throw new Error("Mi API (Ads) falló con código " + miRespuesta.status);
            if (!suRespuesta.ok) throw new Error("La API 28 (Barcos) falló con código " + suRespuesta.status);

            const misDatos = await miRespuesta.json();
            const susDatos = await suRespuesta.json();

            let acumuladorGasto = { "Oceania": 0, "North America": 0, "Asia": 0, "Europe": 0, "Resto del mundo": 0 };
            let acumuladorBarcos = { "Oceania": 0, "North America": 0, "Asia": 0, "Europe": 0, "Resto del mundo": 0 };

            // Procesar MIS datos (Gasto en Ads)
            misDatos.forEach(dato => {
                let region = dato.region || "Resto del mundo";
                if (!acumuladorGasto.hasOwnProperty(region)) region = "Resto del mundo";
                acumuladorGasto[region] += (Number(dato.ad_spend) || 0);
            });

            // Procesar SUS datos (Flota Mercante)
            susDatos.forEach(dato => {
                let region = mapaRegiones[dato.beneficial_ownership_label] || "Resto del mundo";
                acumuladorBarcos[region] += (Number(dato.number_of_ships) || 0);
            });

            // Llenar variables de estado
            categorias = Object.keys(acumuladorGasto);
            dataMiGasto = categorias.map(reg => Math.round(acumuladorGasto[reg])); 
            dataSusBarcos = categorias.map(reg => acumuladorBarcos[reg]);

            cargando = false;
        } catch (error) {
            console.error("Error en la petición:", error);
            errorMensaje = error.message;
            cargando = false;
        }
    });

    // En Svelte 5 usamos $effect para detectar cambios y ejecutar código ajeno a Svelte (Highcharts)
    $effect(() => {
        // Solo renderiza la gráfica si ya no está cargando, no hay errores, y el div ya existe
        if (!cargando && !errorMensaje && chartContainer) {
            Highcharts.chart(chartContainer, {
                chart: { type: 'column' },
                title: { text: 'Gasto en Ads vs Flota Mercante por Región' },
                xAxis: {
                    categories: categorias,
                    crosshair: true
                },
                yAxis: [{ // Eje Y Primario (Izquierda) - Para Ads
                    title: { text: 'Gasto en Ads (USD)' },
                    labels: { format: '${value}' }
                }, { // Eje Y Secundario (Derecha) - Para Barcos
                    title: { text: 'Número de Barcos' },
                    opposite: true 
                }],
                tooltip: { shared: true },
                series: [{
                    name: 'Gasto en Publicidad',
                    type: 'column',
                    yAxis: 0,
                    data: dataMiGasto,
                    tooltip: { valuePrefix: '$' }
                }, {
                    name: 'Flota Mercante',
                    type: 'column',
                    yAxis: 1,
                    data: dataSusBarcos 
                }]
            });
        }
    });
</script>

<main style="padding: 2rem; max-width: 1200px; margin: 0 auto;">
    <h2>Integración de APIs: Ads vs Flota</h2>

    {#if cargando}
        <div style="text-align: center; padding: 3rem;">
            <p>Cargando e integrando datos...</p>
        </div>
    {:else if errorMensaje}
        <div style="background-color: #ffebee; color: #c62828; padding: 1rem; border-radius: 4px;">
            <p><strong>Error de conexión:</strong> {errorMensaje}</p>
        </div>
    {:else}
        <div bind:this={chartContainer} style="width: 100%; height: 500px; border: 1px solid #ccc; border-radius: 8px; padding: 1rem;"></div>
    {/if}
</main>