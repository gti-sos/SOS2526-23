<script>
    import { onMount } from 'svelte';
    import Highcharts from 'highcharts';
    import TreemapModule from 'highcharts/modules/treemap';

    let cargando = $state(true);
    let errorMensaje = $state("");
    let chartContainer = $state();
    let treemapData = $state([]);
    
    let totalAdsRecibidos = $state(0);
    let totalCerealesRecibidos = $state(0);

    const mapaRegiones = {
        "Paraguay": "South America",
        "Afghanistan": "Asia",
        "Spain": "Europe",
        "Oman": "Asia",
        "Mauritania": "Africa",
        "Singapore": "Asia", 
        "United States": "North America",
        "Canada": "North America",
        "Australia": "Oceania"
    };

    const coloresRegiones = {
        "Asia": '#50FFB1',
        "Europe": '#A09FA8',
        "North America": '#E7ECEF',
        "Oceania": '#A9B4C2',
        "South America": '#F5FBEF',
        "Africa": '#FFD700',
        "Other": '#CCCCCC'
    };

    onMount(async () => {
        if (typeof TreemapModule === 'function') {
            TreemapModule(Highcharts);
        } else if (TreemapModule && TreemapModule.default) {
            TreemapModule.default(Highcharts);
        }

        try {
            const miUrl = 'https://sos2526-23.onrender.com/api/v2/global-ads-performance';
            const suUrl = 'https://sos2526-18-cereal-productions-stable.onrender.com/api/v2/cereal-productions';
            
            const [miRespuesta, suRespuesta] = await Promise.all([
                fetch(miUrl),
                fetch(suUrl)
            ]);

            if (!miRespuesta.ok || !suRespuesta.ok) throw new Error("Error HTTP al cargar las APIs");

            const misDatos = await miRespuesta.json();
            const susDatos = await suRespuesta.json();

            totalAdsRecibidos = misDatos.length || 0;
            totalCerealesRecibidos = susDatos.length || 0;

            let regiones = new Set();
            let ingresos = {};
            let cereales = {};

            // Procesar Ads
            misDatos.forEach(d => {
                let reg = d.region || "Other";
                regiones.add(reg);
                ingresos[reg] = (ingresos[reg] || 0) + (Number(d.revenue) || 0);
            });

            // Procesar Cereales
            susDatos.forEach(d => {
                let pais = d.country ? d.country.trim() : "";
                let reg = mapaRegiones[pais] || "Other";
                let valorCereal = d.cereal_production || d.cerealProduction || d.production || 0;
                
                if (valorCereal > 0) {
                    regiones.add(reg);
                    cereales[reg] = (cereales[reg] || 0) + Number(valorCereal);
                }
            });

            let finalData = [];
            regiones.forEach(reg => {
                // Nodo Padre
                finalData.push({
                    id: reg,
                    name: reg,
                    color: coloresRegiones[reg] || coloresRegiones["Other"]
                });

                // Nodo Hijo: Ingresos Ads
                if (ingresos[reg] > 0) {
                    finalData.push({
                        name: 'Ingresos Ads',
                        parent: reg,
                        value: Math.round(ingresos[reg]),
                        unit: 'USD',
                        color: Highcharts.color(coloresRegiones[reg] || '#CCCCCC').brighten(0.1).get()
                    });
                }

                // Nodo Hijo: Producción Cereales (Dividido entre 1000)
                if (cereales[reg] > 0) {
                    finalData.push({
                        name: 'Prod. Cereales',
                        parent: reg,
                        // AQUÍ ESTÁ EL CAMBIO: Se divide entre 1000
                        value: Math.round(cereales[reg] / 100), 
                        unit: 'Miles de toneladas', // AQUÍ SE CAMBIA LA UNIDAD
                        color: Highcharts.color(coloresRegiones[reg] || '#CCCCCC').brighten(-0.1).get()
                    });
                }
            });

            treemapData = finalData;
            cargando = false;

        } catch (e) {
            errorMensaje = e.message;
            cargando = false;
        }
    });

    $effect(() => {
        if (!cargando && chartContainer && treemapData.length > 0) {
            Highcharts.chart(chartContainer, {
                chart: { type: 'treemap' },
                title: { text: 'Comparativa Regional: Economía Digital vs Agrícola' },
                series: [{
                    type: 'treemap',
                    layoutAlgorithm: 'squarified',
                    allowTraversingTree: true,
                    levels: [{
                        level: 1, // CONTINENTES
                        dataLabels: {
                            enabled: true,
                            format: '{point.name}',
                            align: 'left',
                            verticalAlign: 'top',
                            style: { fontSize: '15px', fontWeight: 'bold' }
                        },
                        borderWidth: 3
                    }, {
                        level: 2, // MÉTRICAS
                        dataLabels: {
                            enabled: true,
                            format: '{point.name}<br/>{point.value:,.0f}',
                            align: 'center',
                            verticalAlign: 'middle',
                            style: { fontSize: '12px', textOutline: 'none' }
                        }
                    }],
                    data: treemapData
                }],
                tooltip: {
                    pointFormat: '<b>{point.name}</b>: {point.value:,.0f} {point.unit}'
                }
            });
        }
    });
</script>

<main style="padding: 2rem; max-width: 1200px; margin: 0 auto; font-family: sans-serif;">
    <h2 style="text-align: center;">Análisis Jerárquico: Ads y Agricultura</h2>

    {#if !cargando}
        <div style="display: flex; justify-content: center; gap: 2rem; margin-bottom: 1rem;">
            <span style="background: #e3f2fd; padding: 0.5rem 1rem; border-radius: 8px;">
                📡 API Ads: <strong>{totalAdsRecibidos}</strong> registros
            </span>
            <span style="background: {totalCerealesRecibidos > 0 ? '#e8f5e9' : '#ffebee'}; padding: 0.5rem 1rem; border-radius: 8px;">
                🌾 API Cereales: <strong>{totalCerealesRecibidos}</strong> registros 
                {#if totalCerealesRecibidos === 0} <span style="color: red;">(¡La API del compañero está vacía!)</span> {/if}
            </span>
        </div>
    {/if}

    {#if cargando}
        <div style="text-align: center; padding: 3rem;">
            <p>Conectando con APIs y construyendo mapa de árbol...</p>
        </div>
    {:else if errorMensaje}
        <div style="background-color: #ffebee; color: #c62828; padding: 1rem; border-radius: 4px;">
            <p><strong>Error:</strong> {errorMensaje}</p>
        </div>
    {:else}
        <div bind:this={chartContainer} style="width: 100%; height: 600px; border: 1px solid #ccc; border-radius: 8px;"></div>
    {/if}
</main>