<script>
    // Importamos onMount para ejecutar código solo cuando la página ya está en el navegador
    import { onMount } from 'svelte';

    // chartContainer guardará la referencia al <div> donde se dibujará el gráfico
    let chartContainer;
    
    // Usamos $state("") (novedad de Svelte 5) para guardar errores. Si cambia, Svelte actualiza la pantalla.
    let errorMessage = $state("");

    onMount(async () => {
        // 1. IMPORTACIONES DINÁMICAS (¡Importante para la defensa!)
        // Importamos Highcharts aquí adentro en lugar de arriba del todo.
        // ¿Por qué? Porque Highcharts necesita el objeto 'window' del navegador. 
        // Si lo importamos arriba, el servidor intentará leerlo, fallará y romperá la web (error de SSR).
        const Highcharts = (await import('highcharts')).default;
        const { default: AccessibilityModule } = await import('highcharts/modules/accessibility');
        
        // Activamos el módulo de accesibilidad (para lectores de pantalla, etc.)
        if (typeof AccessibilityModule === 'function') {
            AccessibilityModule(Highcharts);
        }

        try {
            // 2. OBTENER LOS DATOS (¡Los 3 a la vez!)
            // Usamos Promise.all para hacer las 3 peticiones al mismo tiempo. 
            // Esto es mucho más rápido que hacer una, esperar, hacer otra, esperar...
            const [stockRes, adsRes, salesRes] = await Promise.all([
                fetch('/api/v1/daily-global-stock-market-indicators'),
                fetch('/api/v1/global-ads-performance'),
                fetch('/api/v1/online-sales-popular-marketplaces')
            ]);

            // Si alguna de las 3 APIs falla, cortamos el proceso y lanzamos un error
            if (!stockRes.ok || !adsRes.ok || !salesRes.ok) {
                throw new Error("Una de las APIs no respondió correctamente");
            }

            // Convertimos las 3 respuestas a JSON
            const stockData = await stockRes.json();
            const adsData   = await adsRes.json();
            const salesData = await salesRes.json();

            // 3. PROCESAR LOS DATOS (Unificar regiones)
            // Aquí sacamos una lista ÚNICA de todas las regiones que hay en los 3 datasets.
            // Usamos Set para evitar duplicados (ej: si "América" sale 3 veces, solo se guarda una).
            const regions = [...new Set([
                ...stockData.map(d => d.region),
                ...adsData.map(d => d.region),
                ...salesData.map(d => d.region)
            ])].filter(Boolean); // filter(Boolean) quita los nulos o vacíos

            // Preparamos los arrays vacíos para las 3 líneas/barras del gráfico
            const stockSeries = [];
            const adsSeries   = [];
            const salesSeries = [];

            // Recorremos cada región (ej: "Norteamérica", "Europa"...) para calcular sus datos
            regions.forEach(region => {
                // Pasamos todo a minúsculas y quitamos espacios para evitar fallos de coincidencia
                const regionNorm = region.toLowerCase().trim();

                // -- BOLSA (Hacemos la MEDIA de los cierres) --
                const regionStocks = stockData.filter(d => d.region?.toLowerCase().trim() === regionNorm);
                const avgClose = regionStocks.length
                    ? regionStocks.reduce((sum, d) => sum + Number(d.close || 0), 0) / regionStocks.length
                    : 0;
                stockSeries.push(Number(avgClose.toFixed(2))); // Guardamos con 2 decimales

                // -- PUBLICIDAD (Hacemos la SUMA de los ingresos) --
                const regionAds = adsData.filter(d => d.region?.toLowerCase().trim() === regionNorm);
                const totalAdsRevenue = regionAds.reduce((sum, d) => sum + Number(d.revenue || 0), 0);
                adsSeries.push(Number(totalAdsRevenue.toFixed(2)));

                // -- VENTAS (Hacemos la SUMA de las ventas totales) --
                const regionSales = salesData.filter(d => d.region?.toLowerCase().trim() === regionNorm);
                const totalSales = regionSales.reduce((sum, d) => sum + Number(d.total || 0), 0);
                salesSeries.push(Number(totalSales.toFixed(2)));
            });

            // 4. DIBUJAR EL GRÁFICO CON HIGHCHARTS
            Highcharts.chart(chartContainer, {
                chart: {
                    zoomType: 'xy', // Permite hacer zoom arrastrando el ratón en ambos ejes
                    style: { fontFamily: 'Arial, sans-serif' },
                    marginLeft: 170,  // Dejamos hueco a la izquierda para los ejes
                    marginRight: 80,  // Dejamos hueco a la derecha para el otro eje
                    events: {
                        // Este evento dibuja una línea separadora bonita en el gráfico cada vez que se renderiza
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
                title: { text: 'Análisis Integrado: Bolsa, Publicidad y Ventas Online' },
                subtitle: { text: 'Publicidad (barras) · Bolsa y Ventas Online (líneas con ejes propios)' },
                accessibility: { enabled: true },

                // Eje X: Las regiones (América, Europa, Asia...)
                xAxis: {
                    categories: regions,
                    crosshair: true // La línea vertical gris que sigue al ratón
                },

                // 5. LOS EJES Y (¡Ojo aquí! Hay 3 ejes distintos porque medimos cosas diferentes)
                yAxis: [
                    {   // Eje Y 1: Publicidad (En dólares $)
                        title: { text: 'Publicidad ($)', style: { color: '#4e9af1' } },
                        labels: {
                            // Formateamos los números para que 1000000 se vea como "$1.0M" y no ocupe media pantalla
                            formatter: function () {
                                if (this.value >= 1000000) return '$' + (this.value / 1000000).toFixed(1) + 'M';
                                if (this.value >= 1000)    return '$' + (this.value / 1000).toFixed(0) + 'K';
                                return '$' + this.value;
                            },
                            style: { color: '#4e9af1' }
                        },
                        min: 0
                    },
                    {   // Eje Y 2: Bolsa (En puntos, se pone a la derecha 'opposite: true')
                        title: { text: 'Bolsa (pts)', style: { color: '#8bbc21' } },
                        labels: {
                            formatter: function () {
                                if (this.value >= 1000) return (this.value / 1000).toFixed(0) + 'K pts';
                                return this.value + ' pts';
                            },
                            style: { color: '#8bbc21' }
                        },
                        opposite: true, // Lo manda al lado derecho del gráfico
                        gridLineWidth: 0, // Quitamos las líneas de fondo para no ensuciar el gráfico
                        min: 0
                    },
                    {   // Eje Y 3: Ventas Online (En dólares $)
                        title: { text: 'Ventas Online ($)', style: { color: '#e85d04' } },
                        labels: {
                            formatter: function () {
                                if (this.value >= 1000) return '$' + (this.value / 1000).toFixed(1) + 'K';
                                return '$' + this.value;
                            },
                            style: { color: '#e85d04' }
                        },
                        opposite: false,
                        gridLineWidth: 0,
                        offset: 90, // Lo desplazamos 90px a la izquierda para que no se superponga con el eje 1
                        min: 0
                    }
                ],

                // Tooltip: El cuadrito que sale al pasar el ratón por encima
                tooltip: {
                    shared: true, // 'shared' hace que te muestre los datos de los 3 a la vez
                    backgroundColor: 'rgba(255,255,255,0.97)',
                    formatter: function () {
                        // Personalizamos el HTML del tooltip para poner los símbolos de $ o pts según toque
                        let s = `<b>${this.points[0].key}</b><br/>`;
                        this.points.forEach(p => {
                            const color = p.series.color;
                            let val = p.series.name === 'Cierre Medio Bolsa' 
                                ? Highcharts.numberFormat(p.y, 2) + ' pts'
                                : '$' + Highcharts.numberFormat(p.y, 2);
                            s += `<span style="color:${color}">●</span> ${p.series.name}: <b>${val}</b><br/>`;
                        });
                        return s;
                    }
                },

                // Opciones generales para el diseño de barras y líneas
                plotOptions: {
                    column: { borderRadius: 5, dataLabels: { enabled: true } }, // Barras redondeadas
                    spline: { lineWidth: 2.5, dataLabels: { enabled: true } }   // Líneas curvas suavizadas (spline)
                },

                // 6. LOS DATOS FINALES QUE SE DIBUJAN
                // Aquí enlazamos cada set de datos procesado con su Eje Y correspondiente (yAxis: 0, 1 o 2)
                series: [
                    { name: 'Ingresos por Publicidad', type: 'column', yAxis: 0, data: adsSeries, color: '#4e9af1' },
                    { name: 'Cierre Medio Bolsa', type: 'spline', yAxis: 1, data: stockSeries, color: '#8bbc21' },
                    { name: 'Ventas Online Totales', type: 'spline', yAxis: 2, data: salesSeries, color: '#e85d04' }
                ]
            });

        } catch (error) {
            // Si algo explota en el Promise.all o al procesar los datos, lo capturamos aquí
            console.error("Error procesando los datos:", error);
            errorMessage = "Hubo un problema al cargar los datos combinados."; // Mostramos el error en pantalla
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
    /* Estilos básicos para mantener todo centrado, con márgenes y legible */
    main { max-width: 1100px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    h1 { color: #333; margin: 0; }
    
    /* Estilo de botón para el enlace de volver */
    .btn-back { background-color: #6c757d; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-weight: bold; }
    .btn-back:hover { background-color: #5a6268; }
    
    /* Estilos para que el error se vea como una alerta */
    .error-box { background-color: #ffebee; color: #c62828; padding: 15px; border-radius: 5px; margin-bottom: 20px; border: 1px solid #ef9a9a; }
    
    /* Sombra y fondo blanco para enmarcar el gráfico bonito */
    .chart-wrapper { background: white; padding: 20px 15px 15px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
</style>