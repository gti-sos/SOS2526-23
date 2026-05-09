<script>
    import { onMount } from 'svelte';

    let chartContainer;
    let errorMessage = $state("");

    onMount(async () => {
        // ✅ Imports dinámicos dentro del onMount para evitar el problema de SSR
        // ARGUMENTO DE DEFENSA: Control de Módulos y SSR.
        // Como Highcharts manipula directamente el DOM (el 'window'), si el servidor de SvelteKit 
        // intenta pre-renderizarlo, dará error. Importarlo dinámicamente aquí asegura que 
        // solo se ejecute en el navegador del cliente.
        const Highcharts = (await import('highcharts')).default;
        
        // Importación del módulo de accesibilidad. Esto es una buena práctica para cumplir 
        // con estándares web (WCAG), permitiendo que lectores de pantalla interactúen con la gráfica.
        const { default: AccessibilityModule } = await import('highcharts/modules/accessibility');
        if (typeof AccessibilityModule === 'function') {
            AccessibilityModule(Highcharts);
        }

        try {
            // ARGUMENTO DE DEFENSA: Optimización de Red (Promise.all).
            // No hacemos las peticiones en cascada (una tras otra, usando 'await' secuenciales),
            // lo cual sería muy lento. Usamos Promise.all para disparar las tres llamadas a 
            // nuestras diferentes APIs (Bolsa, Publicidad, Ventas) AL MISMO TIEMPO y en paralelo.
            // El código solo avanza cuando TODAS han respondido.
            const [stockRes, adsRes, salesRes] = await Promise.all([
                fetch('/api/v1/daily-global-stock-market-indicators'),
                fetch('/api/v1/global-ads-performance'),
                fetch('/api/v1/online-sales-popular-marketplaces')
            ]);

            // Validación de robustez: Si ALGUNA de las APIs de mis compañeros falla, abortamos
            // controladamente en lugar de mostrar una gráfica rota o datos parciales.
            if (!stockRes.ok || !adsRes.ok || !salesRes.ok) {
                throw new Error("Una de las APIs no respondió correctamente");
            }

            // Parseo simultáneo a JSON
            const stockData = await stockRes.json();
            const adsData   = await adsRes.json();
            const salesData = await salesRes.json();

            // ARGUMENTO DE DEFENSA: Normalización del Eje X (Regiones).
            // Para poder comparar peras con manzanas (Bolsa vs Ads vs Ventas), necesitamos 
            // un eje común. Aquí extraemos todas las regiones únicas de las tres APIs 
            // combinando arreglos, usando un Set() para eliminar duplicados y .filter(Boolean) 
            // para limpiar posibles valores nulos o vacíos.
            const regions = [...new Set([
                ...stockData.map(d => d.region),
                ...adsData.map(d => d.region),
                ...salesData.map(d => d.region)
            ])].filter(Boolean);

            // Arrays que guardarán los datos finales procesados para Highcharts
            const stockSeries = [];
            const adsSeries   = [];
            const salesSeries = [];

            // ARGUMENTO DE DEFENSA: Algoritmo de Agrupación y Reducción (Map-Reduce pattern).
            // Iteramos sobre las regiones unificadas y "pescamos" los datos correspondientes
            // en cada uno de los 3 datasets originales.
            regions.forEach(region => {
                // Normalizamos el string (minúsculas y sin espacios extra) porque al ser APIs 
                // construidas por personas diferentes, "Asia", "asia" o " Asia " podrían no cruzar bien.
                const regionNorm = region.toLowerCase().trim();

                // 1. Procesamiento API Bolsa (Media del precio de cierre)
                const regionStocks = stockData.filter(d => d.region?.toLowerCase().trim() === regionNorm);
                const avgClose = regionStocks.length
                    ? regionStocks.reduce((sum, d) => sum + Number(d.close || 0), 0) / regionStocks.length
                    : 0;
                stockSeries.push(Number(avgClose.toFixed(2))); // Redondeo a 2 decimales para evitar problemas de coma flotante

                // 2. Procesamiento API Publicidad (Suma total de ingresos)
                const regionAds = adsData.filter(d => d.region?.toLowerCase().trim() === regionNorm);
                const totalAdsRevenue = regionAds.reduce((sum, d) => sum + Number(d.revenue || 0), 0);
                adsSeries.push(Number(totalAdsRevenue.toFixed(2)));

                // 3. Procesamiento API Ventas (Suma total de ventas)
                const regionSales = salesData.filter(d => d.region?.toLowerCase().trim() === regionNorm);
                const totalSales = regionSales.reduce((sum, d) => sum + Number(d.total || 0), 0);
                salesSeries.push(Number(totalSales.toFixed(2)));
            });

            // RENDERIZADO DEL GRÁFICO MULTI-EJE
            Highcharts.chart(chartContainer, {
                chart: {
                    zoomType: 'xy', // Permite al usuario hacer zoom arrastrando el ratón en ambos ejes
                    style: { fontFamily: 'Arial, sans-serif' },
                    marginLeft: 170, // Espacio extra a la izquierda para los Ejes Y múltiples
                    marginRight: 80,
                    // Evento de renderizado: Se dibuja una línea vertical punteada para separar/decorar
                    events: {
                        render: function () {
                            const chart = this;
                            const axis0 = chart.yAxis[0];

                            const x = axis0.left - 5;
                            const y1 = chart.plotTop;
                            const y2 = chart.plotTop + chart.plotHeight;

                            if (chart.separatorLine) chart.separatorLine.destroy();
                            chart.separatorLine = chart.renderer
                                .path(['M', x, y1, 'L', x, y2])
                                .attr({ stroke: '#ddd', 'stroke-width': 1.5, 'stroke-dasharray': '4,3' })
                                .add();
                        }
                    }
                },
                title: {
                    text: 'Análisis Integrado: Bolsa, Publicidad y Ventas Online',
                    style: { fontSize: '16px', fontWeight: '700', color: '#222' }
                },
                subtitle: {
                    text: 'Publicidad (barras) · Bolsa y Ventas Online (líneas con ejes propios)',
                    style: { color: '#777', fontSize: '12px' }
                },
                accessibility: { enabled: true },

                xAxis: {
                    categories: regions, // El Eje X es nuestra lista normalizada de continentes
                    crosshair: true, // Línea vertical que sigue al ratón para mejorar la lectura
                    labels: { style: { fontSize: '13px', color: '#444' } }
                },

                // ARGUMENTO DE DEFENSA: Manejo de Múltiples Ejes Y.
                // Como los valores de la Bolsa (puntos/índices) y los del dinero ($) tienen
                // escalas totalmente distintas, usamos ejes Y separados. Si pusiéramos todo en el 
                // mismo eje, la línea de la Bolsa (valores pequeños) quedaría aplastada en el fondo a nivel 0.
                yAxis: [
                    // Eje Y 1: Publicidad (Izquierda)
                    {
                        title: {
                            text: 'Publicidad ($)',
                            style: { color: '#4e9af1', fontWeight: '600' }
                        },
                        labels: {
                            // Formateo inteligente de números largos para evitar que el eje sea ilegible
                            formatter: function () {
                                if (this.value >= 1000000) return '$' + (this.value / 1000000).toFixed(1) + 'M';
                                if (this.value >= 1000)    return '$' + (this.value / 1000).toFixed(0) + 'K';
                                return '$' + this.value;
                            },
                            style: { color: '#4e9af1' }
                        },
                        gridLineColor: '#ebebeb',
                        offset: 0,
                        min: 0
                    },
                    // Eje Y 2: Bolsa (Derecha, indicado por 'opposite: true')
                    {
                        title: {
                            text: 'Bolsa (pts)',
                            style: { color: '#8bbc21', fontWeight: '600' }
                        },
                        labels: {
                            formatter: function () {
                                if (this.value >= 1000) return (this.value / 1000).toFixed(0) + 'K pts';
                                return this.value + ' pts';
                            },
                            style: { color: '#8bbc21' }
                        },
                        opposite: true, 
                        gridLineWidth: 0, // Quitamos las líneas de fondo de este eje para no saturar
                        offset: 0,
                        min: 0
                    },
                    // Eje Y 3: Ventas Online (Desplazado a la izquierda mediante 'offset: 90')
                    {
                        title: {
                            text: 'Ventas Online ($)',
                            style: { color: '#e85d04', fontWeight: '600' },
                            margin: 15
                        },
                        labels: {
                            formatter: function () {
                                if (this.value >= 1000) return '$' + (this.value / 1000).toFixed(1) + 'K';
                                return '$' + this.value;
                            },
                            style: { color: '#e85d04' }
                        },
                        opposite: false,
                        gridLineWidth: 0,
                        offset: 90, // Desplaza este eje hacia fuera para que no pise al Eje 1
                        min: 0
                    }
                ],

                // Tooltip compartido: Al pasar por encima de una región, muestra los 3 valores a la vez
                tooltip: {
                    shared: true,
                    backgroundColor: 'rgba(255,255,255,0.97)',
                    borderColor: '#ddd',
                    borderRadius: 8,
                    shadow: true,
                    style: { fontSize: '13px' },
                    // Formateador personalizado para controlar sufijos y prefijos dependiendo de la serie
                    formatter: function () {
                        let s = `<b>${this.points[0].key}</b><br/>`; // Título del tooltip (ej. 'Europe')
                        this.points.forEach(p => {
                            const color = p.series.color;
                            let val = '';
                            if (p.series.name === 'Cierre Medio Bolsa') {
                                val = Highcharts.numberFormat(p.y, 2) + ' pts';
                            } else {
                                val = '$' + Highcharts.numberFormat(p.y, 2);
                            }
                            s += `<span style="color:${color}">●</span> ${p.series.name}: <b>${val}</b><br/>`;
                        });
                        return s;
                    }
                },

                legend: {
                    layout: 'horizontal',
                    align: 'center',
                    verticalAlign: 'bottom',
                    itemStyle: { fontSize: '12px', fontWeight: '500', color: '#333' }
                },

                // Opciones de visualización general
                plotOptions: {
                    column: {
                        borderRadius: 5,
                        borderWidth: 0,
                        pointPadding: 0.15,
                        groupPadding: 0.2,
                        // Etiquetas flotantes sobre cada columna
                        dataLabels: {
                            enabled: true,
                            formatter: function () {
                                if (this.y >= 1000000) return '$' + (this.y / 1000000).toFixed(1) + 'M';
                                if (this.y >= 1000)    return '$' + (this.y / 1000).toFixed(0) + 'K';
                                return '$' + this.y;
                            },
                            style: {
                                fontSize: '11px',
                                fontWeight: '600',
                                color: '#4e9af1',
                                textOutline: 'none'
                            }
                        }
                    },
                    spline: { // Las líneas de tendencia suavizadas
                        lineWidth: 2.5,
                        marker: {
                            radius: 5,
                            lineWidth: 2,
                            fillColor: 'white'
                        },
                        dataLabels: {
                            enabled: true,
                            formatter: function () {
                                if (this.series.name === 'Cierre Medio Bolsa') {
                                    if (this.y >= 1000) return (this.y / 1000).toFixed(1) + 'K';
                                    return this.y;
                                }
                                if (this.y >= 1000) return '$' + (this.y / 1000).toFixed(1) + 'K';
                                return '$' + this.y;
                            },
                            style: {
                                fontSize: '11px',
                                fontWeight: '600',
                                textOutline: 'none'
                            }
                        }
                    }
                },

                // INYECCIÓN FINAL DE DATOS A LA GRÁFICA
                series: [
                    {
                        name: 'Ingresos por Publicidad',
                        type: 'column', // Gráfico de barras
                        yAxis: 0, // Se ata al primer eje Y (izquierda, offset 0)
                        data: adsSeries,
                        color: '#4e9af1',
                        tooltip: { valuePrefix: '$' }
                    },
                    {
                        name: 'Cierre Medio Bolsa',
                        type: 'spline', // Línea suavizada
                        yAxis: 1, // Se ata al segundo eje Y (derecha)
                        data: stockSeries,
                        color: '#8bbc21',
                        tooltip: { valueSuffix: ' pts' },
                        marker: { lineColor: '#8bbc21' },
                        dataLabels: { color: '#8bbc21' }
                    },
                    {
                        name: 'Ventas Online Totales',
                        type: 'spline',
                        yAxis: 2, // Se ata al tercer eje Y (izquierda, separado)
                        data: salesSeries,
                        color: '#e85d04',
                        tooltip: { valuePrefix: '$' },
                        marker: { lineColor: '#e85d04' },
                        dataLabels: { color: '#e85d04' }
                    }
                ]
            });

        } catch (error) {
            console.error("Error procesando los datos:", error);
            // Captura errores globales si el Promise.all falla o si la lógica de mapeo se rompe
            errorMessage = "Hubo un problema al cargar los datos combinados.";
        }
    });
</script>

<main>
    <div class="header">
        <h1>Dashboard Global Combinado</h1>
        <a href="/" class="btn-back">← Volver al inicio</a>
    </div>

    {#if errorMessage}
        <div class="error-box">
            <p>{errorMessage}</p>
        </div>
    {/if}

    <div class="chart-wrapper">
        <div bind:this={chartContainer} style="width: 100%; height: 560px;"></div>
    </div>
</main>

<style>
    main {
        max-width: 1100px;
        margin: 0 auto;
        padding: 20px;
        font-family: Arial, sans-serif;
    }
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }
    h1 { color: #333; margin: 0; }
    .btn-back {
        background-color: #6c757d;
        color: white;
        padding: 8px 16px;
        text-decoration: none;
        border-radius: 4px;
        font-weight: bold;
    }
    .btn-back:hover { background-color: #5a6268; }
    .error-box {
        background-color: #ffebee;
        color: #c62828;
        padding: 15px;
        border-radius: 5px;
        margin-bottom: 20px;
        border: 1px solid #ef9a9a;
    }
    .chart-wrapper {
        background: white;
        padding: 20px 15px 15px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
</style>