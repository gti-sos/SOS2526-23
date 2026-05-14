<script>
    // Importamos la función de Svelte que se ejecuta justo cuando la página carga
    import { onMount } from 'svelte';
    // Importamos la librería principal para hacer gráficos guapos
    import Highcharts from 'highcharts';
    // Importamos el "DLC" o extra de Highcharts que nos deja hacer gráficos de burbujas
    import HighchartsMore from 'highcharts/highcharts-more';

    // Aquí guardaremos la referencia al <div> de abajo donde se va a pintar el gráfico
    let chartContainer;

    // Todo lo que hay aquí dentro se ejecuta nada más abrir la página web
    onMount(async () => {
        // Un pequeño truco técnico para asegurarnos de que el módulo de burbujas carga bien en Svelte
        if (typeof HighchartsMore === 'function') {
            HighchartsMore(Highcharts);
        } else if (HighchartsMore && typeof HighchartsMore.default === 'function') {
            HighchartsMore.default(Highcharts);
        }
        
        try {
            // Le pedimos a nuestra API (nuestro backend) que nos dé los datos de la bolsa
            const response = await fetch('/api/v1/daily-global-stock-market-indicators'); 
            
            // Si el backend da un error (ej. un 404 o 500), lanzamos una alerta y paramos
            if (!response.ok) throw new Error(`Error API: ${response.status}`);
            
            // Transformamos la respuesta de texto del backend en un JSON (un array de objetos que JavaScript entiende)
            const data = await response.json();

            // 1. Extraer categorías: Sacamos solo los nombres de los índices (Ibex, Nasdaq...) para ponerlos abajo en el eje X
            const categoriasEjeX = data.map(item => item.index_name);

            // 2. Transformar los datos: Cogemos los datos crudos y los preparamos como a Highcharts le gusta
            const serieDatos = data.map((item, index) => {
                // Por defecto la burbuja será gris translúcida
                let colorBurbuja = 'rgba(158, 158, 158, 0.6)'; 
                
                // Si el porcentaje diario es positivo (subió), la pintamos de verde
                if (item.daily_change_percent > 0) {
                    colorBurbuja = 'rgba(76, 175, 80, 0.6)'; 
                // Si el porcentaje diario es negativo (bajó), la pintamos de rojo
                } else if (item.daily_change_percent < 0) {
                    colorBurbuja = 'rgba(244, 67, 54, 0.6)'; 
                }

                // Devolvemos el "molde" de la burbuja para este dato concreto
                return {
                    x: index,            // Su posición en la línea horizontal (0, 1, 2...)
                    y: item.close,       // Su altura en el gráfico (precio de cierre)
                    z: item.volume,      // Lo gorda que será la burbuja (volumen de ventas)
                    name: item.index_name, // Nombre para saber cuál es
                    color: colorBurbuja, // Le enchufamos el color que hemos calculado arriba
                    
                    // Todo esto de abajo es "información extra" que guardamos de forma invisible 
                    // para mostrarla luego en el cuadrito (tooltip) cuando pases el ratón por encima
                    fecha: item.date,
                    region: item.region,
                    open: item.open,
                    high: item.high,
                    low: item.low,
                    cambio: item.daily_change_percent
                };
            });

            // 3. ¡Pintamos el gráfico! Le decimos a Highcharts que se meta en nuestro <div> y le pasamos todas estas opciones
            Highcharts.chart(chartContainer, {
                chart: { 
                    type: 'bubble', // Tipo de gráfico: Burbujas
                    plotBorderWidth: 1, // Borde fino alrededor del gráfico entero
                    zoomType: 'xy', // Nos deja hacer zoom con el ratón arrastrando para ver detalles
                    backgroundColor: '#fcfcfc' // Un fondito gris muy clarito para que quede más limpio
                },
                title: { 
                    text: 'Análisis Multidimensional de Índices Bursátiles' // El titulazo principal
                },
                xAxis: { 
                    categories: categoriasEjeX, // Aquí le pasamos la lista de nombres que sacamos al principio (Eje horizontal)
                    title: { text: 'Índices' }, // Título del eje horizontal
                    gridLineWidth: 1 // Ponemos unas rayitas verticales de fondo para que no te pierdas leyendo
                },
                yAxis: { 
                    title: { text: 'Precio de Cierre (Close)' } // Título del eje vertical
                },
                plotOptions: {
                    bubble: {
                        minSize: '5%',  // Tamaño mínimo para que las burbujas chicas no sean invisibles
                        maxSize: '25%', // Tamaño máximo para que las grandes no tapen todo el gráfico
                        marker: {
                            lineColor: '#555', // Les ponemos un bordecito gris oscuro a las burbujas
                            lineWidth: 1 // Grosor de ese bordecito
                        }
                    }
                },
                tooltip: {
                    useHTML: true, // Le decimos que vamos a diseñar el cuadrito flotante de información usando HTML puro
                    headerFormat: '<table>', // Abrimos una tabla para organizar los datos que salen al pasar el ratón
                    
                    // Aquí diseñamos la "tarjeta" metiendo las variables que preparamos en el Paso 2 (fíjate en los {point.algo})
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
                    footerFormat: '</table>', // Cerramos la tabla
                    followPointer: true // El cuadrito perseguirá a tu ratón mientras lo mueves por la burbuja
                },
                series: [{ 
                    name: 'Mercados', 
                    data: serieDatos, // ¡Aquí le metemos todos los datos que procesamos en el paso 2!
                    showInLegend: false // Quitamos la leyenda de abajo porque ya se ve qué es cada cosa en el eje X
                }],
                credits: { enabled: false } // Modo pro: quitamos la marca de agua de "Highcharts.com" abajo a la derecha
            });
        } catch (error) {
            // Si algo revienta en el proceso (ej: se cae el backend), nos lo chivamos por la consola del navegador
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
    /* CSS estándar para dejarlo todo bonito. Márgenes, tipografía, colores del botón... Nada de lógica aquí, solo chapa y pintura. */
    main { 
        padding: 20px; 
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
        max-width: 1200px;
        margin: 0 auto;
    }
    h2 { color: #333; }

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