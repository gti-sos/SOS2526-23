<script>
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';

    /**
     * @type {string | import("highcharts").Options | HTMLElement}
     */
    let chartContainer;
    let errorMessage = '';

    onMount(async () => {
        if (browser) {
            try {
                // 1. IMPORTACIÓN DINÁMICA CORREGIDA
                const HighchartsModule = await import('highcharts');
                const Highcharts = HighchartsModule.default || HighchartsModule;
                
                const SankeyModule = await import('highcharts/modules/sankey');
                // IMPORTANTE: Algunos sistemas necesitan .default y otros no
                const initSankey = SankeyModule.default || SankeyModule;
                
                // Inicializamos el módulo pasándole Highcharts
                if (typeof initSankey === 'function') {
                    initSankey(Highcharts);
                }

                // 2. FETCH DE DATOS
                const response = await fetch('/api/v1/global-ads-performance');
                if (!response.ok) throw new Error("Error cargando la API");
                const apiData = await response.json();

                if (!apiData || apiData.length === 0) {
                    errorMessage = "Base de datos vacía. Carga los datos iniciales primero.";
                    return;
                }

                // 3. PROCESAMIENTO (Métrica: Revenue)
                const linksMap = {};
                apiData.forEach(item => {
                    const { region, platform, industry, revenue } = item;
                    const r = parseFloat(revenue) || 0;
                    
                    const l1 = `${region}|${platform}`;
                    linksMap[l1] = (linksMap[l1] || 0) + r;
                    
                    const l2 = `${platform}|${industry}`;
                    linksMap[l2] = (linksMap[l2] || 0) + r;
                });

                const chartData = Object.entries(linksMap).map(([key, weight]) => {
                    const [from, to] = key.split('|');
                    return { from, to, weight };
                });

                // 4. RENDERIZADO
                Highcharts.chart(chartContainer, {
                    chart: { type: 'sankey' },
                    title: { text: 'Flujo de Ingresos Publicitarios 2024' },
                    subtitle: { text: 'Región → Plataforma → Industria' },
                    accessibility: { enabled: false }, // Evita advertencias en consola
                    tooltip: {
                        style: {
                            fontSize: '18px' // Texto de la burbuja informativa
                        },
                        headerFormat: null,
                        pointFormat: '{point.fromNode.name} \u2192 {point.toNode.name}: <b>${point.weight:,.2f}</b>',
                        nodeFormat: '{point.name}: <b>${point.sum:,.2f}</b>'
                    },
                    series: [{
                        keys: ['from', 'to', 'weight'],
                        data: chartData,
                        name: 'Revenue (Ingresos)',
                        nodes: [
                        // REGIONES
                        { id: 'Asia', color: '#27AE60' },
                        { id: 'Europe', color: '#2980B9' },
                        { id: 'North America', color: '#7F8C8D' },

                        // PLATAFORMAS
                        { id: 'TikTok Ads', color: '#E91E63' },
                        { id: 'Meta Ads', color: '#1976D2' },
                        { id: 'Google Ads', color: '#FFC107' },

                        // INDUSTRIAS
                        { id: 'EdTech', color: '#8E44AD' },
                        { id: 'Fintech', color: '#16A085' },
                        { id: 'Healthcare', color: '#E67E22' },
                        { id: 'SaaS', color: '#AFB42B' },
                        { id: 'E-commerce', color: '#A04000' }
                        ],
                        linkOpacity: 0.5,
                        dataLabels: {
                        enabled: true,
                        style: {
                            fontSize: '15px',      // Tamaño de los nombres de los nodos (Europe, TikTok, etc.)
                            fontWeight: 'bold',
                            color: '#000',
                        }
                        }
                    }]
                });

            } catch (error) {
                console.error("Error al montar la gráfica:", error);
                errorMessage = "Error técnico al inicializar el diagrama.";
            }
        }
    });
</script>

<main>
    <h2>Dashboard global de Analíticas 2024</h2>
    
    {#if errorMessage}
        <div class="alert">{errorMessage}</div>
    {/if}
    
    <div bind:this={chartContainer} class="chart-container"></div>
    
    <div class="button-map">
        <a class="buttonEnlace" href="/analytics/global-ads-performance/map">🌍 Ver Mapa Interactivo</a>
    </div>
</main>

<style>
    h2 {
        text-align: center;
        color: #1a202c;
        margin-bottom: 20px;
    }

    .chart-container {
        width: 100%;
        height: 550px;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        margin-bottom: 20px; /* Da un poco de aire antes del botón */
    }

    .alert {
        color: #721c24;
        background-color: #f8d7da;
        padding: 10px;
        border-radius: 4px;
        text-align: center;
        margin-bottom: 10px;
        border: 1px solid #f5c6cb;
    }

    /* Agrupación y centrado del botón */
    .button-map {
        display: flex;
        justify-content: center; /* Esto centra el botón en la pantalla */
        margin-top: 20px;
        margin-bottom: 30px;
    }

    /* Estilos del botón (recuperados de tu home) */
    .buttonEnlace {
        display: inline-block;
        padding: 12px 24px;
        background-color: #007bff;
        color: white;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 500;
        font-size: 1rem;
        transition: all 0.2s ease-in-out;
        box-shadow: 0 2px 4px rgba(0, 123, 255, 0.2);
    }

    .buttonEnlace:hover {
        background-color: #0056b3;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
    }
</style>