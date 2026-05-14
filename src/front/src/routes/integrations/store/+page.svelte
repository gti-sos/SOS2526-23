<script>
    import { onMount, tick } from 'svelte';
    // onMount → ejecuta código al cargar la página
    // tick → espera a que Svelte actualice el DOM antes de continuar (lo necesitamos para ApexCharts)

    // --- Variables reactivas con Svelte 5 ($state) ---
    // $state hace que cuando cambien estas variables, la pantalla se actualice automáticamente
    let misDatosBolsa = $state([]);       // Aquí guardaremos los datos de nuestra API de bolsa
    let productosDatos = $state([]);      // Aquí los productos que nos devuelve DummyJSON
    let cargando = $state(true);          // Mientras sea true mostramos el spinner de carga
    let errorCarga = $state(false);       // Si algo falla, se pone a true y mostramos el mensaje de error
    
    // Esta variable apuntará directamente al div del DOM donde ApexCharts pintará la gráfica
    // Es como un getElementById pero a la manera de Svelte (se conecta con bind:this en el HTML)
    let contenedorGrafica = $state(null);

    onMount(async () => {
        try {
            // Importamos ApexCharts de forma dinámica (lazy) para evitar errores de SSR
            // SSR = Server Side Rendering, cuando Svelte intenta ejecutar código de navegador en el servidor
            const ApexChartsModule = await import('apexcharts');
            const ApexCharts = ApexChartsModule.default || ApexChartsModule; // Compatibilidad con distintos formatos de exportación

            // Con ApexCharts ya cargado, llamamos a la función que pide datos y dibuja
            await cargarYDibujar(ApexCharts);
        } catch (e) {
            console.error("Error al inicializar ApexCharts:", e);
            errorCarga = true;  // Activamos el mensaje de error en pantalla
            cargando = false;   // Quitamos el spinner
        }
    });

    async function cargarYDibujar(ApexCharts) {
        try {
            // Lanzamos las dos peticiones A LA VEZ con Promise.all para no esperar una detrás de otra
            // Es más eficiente que hacer dos await seguidos
            const [resBolsa, resStore] = await Promise.all([
                fetch('/api/v1/daily-global-stock-market-indicators'), // Nuestra API de bolsa
                fetch('/api/v1/proxy/store')                           // Proxy a DummyJSON (pasa por nuestro backend para no exponer claves)
            ]);

            // Si cualquiera de las dos APIs devuelve error HTTP, lo lanzamos nosotros manualmente
            if (!resBolsa.ok || !resStore.ok) {
                throw new Error(`Error en las APIs: Bolsa(${resBolsa.status}) Tienda(${resStore.status})`);
            }

            // Parseamos las respuestas a JSON y las guardamos en las variables reactivas
            misDatosBolsa = await resBolsa.json();
            
            // DummyJSON no devuelve el array directamente, lo mete dentro de una propiedad .products
            const datosStoreRespuesta = await resStore.json();
            productosDatos = datosStoreRespuesta.products;

            // Comprobación de seguridad: si los datos no son arrays algo fue muy mal
            if (!Array.isArray(misDatosBolsa) || !Array.isArray(productosDatos)) {
                throw new Error("El formato de los datos recibidos no es un array válido");
            }

            // --- Preparamos los datos para la gráfica ---
            let categorias = [];    // Etiquetas del eje X
            let serieBolsa = [];    // Valores de las barras (volumen de bolsa)
            let serieProducto = []; // Valores de la línea (precio de producto)
            
            // Cogemos el mínimo entre los dos arrays y 5, para no pintar más de 5 puntos
            // Así no se desborda la gráfica aunque una API devuelva más datos que la otra
            const limite = Math.min(misDatosBolsa.length, productosDatos.length, 5);

            for (let i = 0; i < limite; i++) {
                // Eje X: combinamos nombre del índice bursátil + nombre del producto (recortado a 10 chars para que quepa)
                categorias.push(`${misDatosBolsa[i].index_name} / ${productosDatos[i].title.substring(0, 10)}...`);
                
                // El volumen de bolsa viene en unidades muy grandes, lo dividimos entre 1M para que sea legible en la gráfica
                serieBolsa.push(Math.round(misDatosBolsa[i].volume / 1000000));
                
                // El precio del producto viene ya en una escala normal, lo usamos directamente
                serieProducto.push(productosDatos[i].price);
            }

            cargando = false; // Ya tenemos datos, apagamos el spinner

            // tick() espera a que Svelte aplique los cambios del DOM
            // Sin esto, contenedorGrafica podría ser null todavía cuando ApexCharts intente usarlo
            await tick();

            // Solo pintamos si el contenedor existe y tenemos datos
            if (contenedorGrafica && categorias.length > 0) {
                const opciones = {
                    series: [{
                        name: 'Volumen Bolsa (M)',
                        type: 'column',    // Barras para el volumen
                        data: serieBolsa
                    }, {
                        name: 'Precio Producto ($)',
                        type: 'line',      // Línea para el precio del producto
                        data: serieProducto
                    }],
                    chart: {
                        height: 500,
                        type: 'line',      // Tipo base del gráfico (mezcla barras + línea)
                        fontFamily: 'Arial, sans-serif',
                        toolbar: { show: true } // Muestra botones de zoom, descarga, etc.
                    },
                    stroke: {
                        width: [0, 4] // Las barras no tienen borde (0), la línea tiene 4px de grosor
                    },
                    title: {
                        text: 'Comparativa: Mi Bolsa vs DummyJSON Store',
                        align: 'center',
                        style: { fontSize: '20px' }
                    },
                    colors: ['#2a9d8f', '#e9c46a'], // Verde para barras, amarillo para la línea
                    xaxis: {
                        categories: categorias // Las etiquetas del eje X que preparamos antes
                    },
                    yaxis: [
                        {
                            // Eje Y izquierdo → para el volumen de bolsa
                            title: { text: 'Volumen (Millones de $)' },
                        }, 
                        {
                            opposite: true, // Este eje aparece a la DERECHA, así no se pisan las escalas
                            title: { text: 'Precio Producto ($)' }
                        }
                    ],
                    tooltip: {
                        shared: true,     // El tooltip muestra datos de ambas series a la vez
                        intersect: false  // Se activa al pasar cerca, no solo encima exacto del punto
                    }
                };

                // Creamos la instancia de ApexCharts pasándole el div donde pintarla y las opciones
                const chart = new ApexCharts(contenedorGrafica, opciones);
                chart.render(); // ¡A pintar!
            }
        } catch (error) {
            console.error("❌ Error cargando datos en el frontend:", error);
            errorCarga = true;  // Mostramos el mensaje de error al usuario
            cargando = false;   // Quitamos el spinner
        }
    }
</script>

<main style="padding: 20px; font-family: sans-serif; max-width: 1000px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h2>🛒 Integración Real: API Bolsa + DummyJSON</h2>
        <p>Consumiendo datos externos a través de un <strong>Proxy Seguro</strong> en el Backend.</p>
    </div>

    <!-- Solo se muestra si hubo algún error durante la carga -->
    {#if errorCarga}
        <div style="background: #fff5f5; color: #c53030; padding: 20px; border: 1px solid #feb2b2; border-radius: 8px; text-align: center;">
            <p>⚠️ <strong>¡Ups! Algo ha fallado:</strong></p>
            <p>No se han podido cargar los datos. Revisa que el Backend esté desplegado en Render y que las rutas coincidan.</p>
        </div>
    {/if}

    <!-- Spinner de carga: solo visible mientras esperamos las APIs y no hay error -->
    {#if cargando && !errorCarga}
        <div style="text-align: center; padding: 50px;">
            <!-- Este div gira gracias a la animación CSS 'spin' definida abajo -->
            <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; margin: 0 auto;"></div>
            <p style="margin-top: 15px; color: #666;">Obteniendo datos de los servidores...</p>
        </div>
    {/if}

    <!-- Aquí se pintará la gráfica. bind:this conecta este div con la variable contenedorGrafica -->
    <!-- Usamos display:none mientras carga para que ApexCharts no falle al intentar renderizar en un div invisible -->
    <div 
        bind:this={contenedorGrafica} 
        style="width: 100%; background: white; padding: 15px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); {cargando ? 'display:none' : 'display:block'}"
    ></div>

    <div style="margin-top: 30px; text-align: center;">
        <a href="/integrations" style="text-decoration: none; color: #4a5568; font-weight: bold; padding: 10px 20px; border: 1px solid #cbd5e0; border-radius: 5px; background: #edf2f7;">
            ⬅ Volver al Panel de Integraciones
        </a>
    </div>
</main>

<style>
    /* Animación del spinner: gira 360º de forma continua */
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
</style>