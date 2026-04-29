<script>
    import { onMount } from 'svelte';
    import Highcharts from 'highcharts';
    import HighchartsMore from 'highcharts/highcharts-more';

    let chartContainer;

    onMount(async () => {
        // Inicializar el módulo para burbujas
        if (typeof HighchartsMore === 'function') {
            HighchartsMore(Highcharts);
        } else if (HighchartsMore && typeof HighchartsMore.default === 'function') {
            HighchartsMore.default(Highcharts);
        }
        
        try {
            const response = await fetch('/api/v1/daily-global-stock-market-indicators'); 
            if (!response.ok) throw new Error(`Error API: ${response.status}`);
            const data = await response.json();

            // 1. Extraer categorías para el Eje X (Nombres de los índices)
            const categoriasEjeX = data.map(item => item.index_name);

            // 2. Transformar los datos con colores dinámicos
            const serieDatos = data.map((item, index) => {
                // Lógica de colores: Verde si sube, Rojo si baja
                let colorBurbuja = 'rgba(158, 158, 158, 0.6)'; // Gris por defecto
                if (item.daily_change_percent > 0) {
                    colorBurbuja = 'rgba(76, 175, 80, 0.6)'; // Verde translúcido
                } else if (item.daily_change_percent < 0) {
                    colorBurbuja = 'rgba(244, 67, 54, 0.6)'; // Rojo translúcido
                }

                return {
                    x: index,            // Posición horizontal (0, 1, 2...)
                    y: item.close,       // Eje Y: Precio de cierre
                    z: item.volume,      // Tamaño: Volumen
                    name: item.index_name,
                    color: colorBurbuja, // Inyectamos el color directamente
                    // Datos extra para el tooltip
                    fecha: item.date,
                    region: item.region,
                    open: item.open,
                    high: item.high,
                    low: item.low,
                    cambio: item.daily_change_percent
                };
            });

            // 3. Pintar el gráfico con el nuevo diseño
            Highcharts.chart(chartContainer, {
                chart: { 
                    type: 'bubble', 
                    plotBorderWidth: 1, 
                    zoomType: 'xy',
                    backgroundColor: '#fcfcfc' // Fondo un poco más elegante
                },
                title: { 
                    text: 'Análisis Multidimensional de Índices Bursátiles' 
                },
                xAxis: { 
                    categories: categoriasEjeX, // Ahora los índices están separados
                    title: { text: 'Índices' },
                    gridLineWidth: 1 // Líneas verticales para guiar la vista
                },
                yAxis: { 
                    title: { text: 'Precio de Cierre (Close)' } 
                },
                plotOptions: {
                    bubble: {
                        minSize: '5%',  // Evita que las burbujas sean minúsculas
                        maxSize: '25%', // Evita que ocupen toda la pantalla
                        marker: {
                            lineColor: '#555', // Borde oscuro para definirlas mejor
                            lineWidth: 1
                        }
                    }
                },
                tooltip: {
                    useHTML: true,
                    headerFormat: '<table>',
                    pointFormat: `
                        <tr><th colspan="2" style="font-size: 1.1em; text-align: center;"><b>{point.name}</b> ({point.region})</th></tr>
                        <tr><td colspan="2"><hr/></td></tr>
                        <tr><th>Fecha:</th><td>{point.fecha}</td></tr>
                        <tr><th>Cierre:</th><td><b>{point.y}</b></td></tr>
                        <tr><th>Apertura:</th><td>{point.open}</td></tr>
                        <tr><th>Máx/Mín:</th><td>{point.high} / {point.low}</td></tr>
                        <tr><th>Volumen:</th><td>{point.z}</td></tr>
                        <tr><th>Cambio Diario:</th><td style="color: {point.color}; font-weight: bold;">{point.cambio}%</td></tr>
                    `,
                    footerFormat: '</table>',
                    followPointer: true
                },
                series: [{ 
                    name: 'Mercados', 
                    data: serieDatos,
                    showInLegend: false // Quitamos la leyenda porque ya está claro en el eje X
                }],
                credits: { enabled: false } // Quitamos el logo de Highcharts abajo a la derecha
            });
        } catch (error) {
            console.error("Fallo al cargar o pintar los datos:", error);
        }
    });
</script>

<main>
    <h2>Visualización Individual Integral</h2>
    <p>Este gráfico de <b>burbujas</b> integra todas las variables: el Precio define la altura, el Volumen el tamaño de la burbuja, y el Color indica si el mercado subió (Verde) o bajó (Rojo).</p>

    <div bind:this={chartContainer} style="width: 100%; height: 600px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"></div>

    <div class="map-button-container">
        <a href="/analytics/daily-global-stock-market-indicators/map" class="btn-mapa">
            🌍 Ver Mapa Geoespacial de Mercados
        </a>
    </div>
</main>

<style>
    main { 
        padding: 20px; 
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
        max-width: 1200px;
        margin: 0 auto;
    }
    h2 { color: #333; }

    /* Estilos para el botón del mapa */
    .map-button-container {
        text-align: center;
        margin-top: 30px;
        margin-bottom: 20px;
    }

    .btn-mapa {
        background-color: #0056b3;
        color: white;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: bold;
        font-size: 1.1em;
        transition: background-color 0.3s ease;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .btn-mapa:hover {
        background-color: #003d82;
    }
</style>