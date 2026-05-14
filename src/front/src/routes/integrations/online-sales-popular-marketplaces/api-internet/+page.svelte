<script>
    import { onMount, tick } from 'svelte';
    import c3 from 'c3';
    import 'c3/c3.css';

    // Estados reactivos de Svelte 5
    let cargando = $state(true);
    let errorMensaje = $state("");
    
    // Referencias al DOM y a la instancia de la gráfica
    let chartElement = $state();

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
    }

    onMount(async () => {
        try {

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
            let columnasC3 = [];
            let mapeoEjesX = {};

            regionesActivas.forEach(region => {
                const nombreEjeX = `x_${region}`;
                const valorInternet = contadoresPaises[region] > 0 
                    ? (internetPorRegion[region] / contadoresPaises[region]) 
                    : 0;
                
                mapeoEjesX[region] = nombreEjeX;
                columnasC3.push([nombreEjeX, valorInternet]); // Datos eje X
                columnasC3.push([region, ventasPorRegion[region]]); // Datos eje Y
            });

            cargando = false;
            await tick();

            // Renderizado de C3
            c3.generate({
                bindto: chartElement,
                data: {
                    xs: mapeoEjesX,
                    columns: columnasC3,
                    type: 'scatter'
                },
                axis: {
                    x: {
                        label: 'Penetración de Internet (%)',
                        tick: { format: d => d.toFixed(1) + '%' }
                    },
                    y: {
                        label: 'Ingresos Online (USD)',
                        tick: { 
                            format: d => new Intl.NumberFormat('en-US', { 
                                style: 'currency', currency: 'USD', maximumFractionDigits: 0 
                            }).format(d) 
                        }
                    }
                },
                point: { r: 10 }, // Tamaño de los puntos (similar al radius de Chart.js)
                grid: { x: { show: true }, y: { show: true } },
                tooltip: {
                    format: {
                        title: () => "Detalle por Región",
                        value: (value, ratio, id) => {
                            if (id.startsWith('x_')) return value.toFixed(2) + '% (Internet)';
                            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
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
            <div bind:this={chartElement}></div>
        </div>
    {/if}
</main>