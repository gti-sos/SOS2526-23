<script>
    import { onMount } from 'svelte';
    import Highcharts from 'highcharts';
    import highchartsSankey from 'highcharts/modules/sankey';

    // Referencia al contenedor del DOM y estado de error en Svelte 5
    let container;
    let errorMessage = $state("");

    onMount(async () => {
        // Inicializar el módulo necesario de Highcharts
        highchartsSankey(Highcharts);

        try {
            // Peticiones fetch concurrentes a ambas APIs
            const [resAds, resFleets] = await Promise.all([
                fetch('https://sos2526-23.onrender.com/api/v2/global-ads-performance'),
                fetch('https://sos2526-28.onrender.com/api/v2/beneficial-ownership-merchant-fleets')
            ]);

            if (!resAds.ok || !resFleets.ok) {
                throw new Error("Error al obtener los datos de las APIs externas.");
            }

            const adsData = await resAds.json();
            const fleetsData = await resFleets.json();

            // Transformar y unificar los datos en formato [De, A, Peso]
            const flowData = [];

            // Procesar API 1: Ads Performance (Región -> Plataforma publicitaria, peso: Conversiones)
            const adsMap = new Map();
            adsData.forEach(ad => {
                const key = `${ad.region}|${ad.platform}`;
                adsMap.set(key, (adsMap.get(key) || 0) + ad.conversion);
            });
            
            adsMap.forEach((weight, key) => {
                const [from, to] = key.split('|');
                flowData.push([from, to, weight]);
            });

            // Procesar API 2: Merchant Fleets (Bandera de registro -> Propietario, peso: Número de barcos)
            const fleetsMap = new Map();
            fleetsData.forEach(fleet => {
                const key = `${fleet.flag_of_registration_label}|${fleet.beneficial_ownership_label}`;
                fleetsMap.set(key, (fleetsMap.get(key) || 0) + fleet.number_of_ships);
            });
            
            fleetsMap.forEach((weight, key) => {
                const [from, to] = key.split('|');
                flowData.push([from, to, weight]);
            });

            // Configuración de Highcharts
            Highcharts.chart(container, {
                chart: {
                    type: 'sankey'
                },
                title: {
                    text: 'Flujos Globales: Rendimiento de Anuncios y Flotas Mercantes'
                },
                subtitle: {
                    text: 'Integración de datos conjuntos'
                },
                accessibility: {
                    point: {
                        valueDescriptionFormat: '{point.from} a {point.to}: {point.weight}.'
                    }
                },
                tooltip: {
                    headerFormat: '<span style="font-size: 1.2em">{point.key}</span><br/>',
                    pointFormat: '<b>{point.from}</b> \u2192 <b>{point.to}</b>: {point.weight}',
                    nodeFormat: '{point.name}: <b>{point.sum}</b> totales'
                },
                series: [{
                    keys: ['from', 'to', 'weight'],
                    data: flowData,
                    name: 'Relaciones Globales',
                    dataLabels: {
                        style: {
                            color: '#000000',
                            textOutline: 'none',
                            fontSize: '0.9em'
                        }
                    }
                }]
            });

        } catch (error) {
            console.error(error);
            errorMessage = error.message;
        }
    });
</script>

<main>
    {#if errorMessage}
        <div style="color: red; padding: 1rem; border: 1px solid red; border-radius: 4px;">
            {errorMessage}
        </div>
    {:else}
        <div bind:this={container} style="width: 100%; height: 700px; margin: 0 auto;"></div>
    {/if}
</main>

<style>
    main {
        padding: 2rem;
        font-family: Arial, sans-serif;
    }
</style>