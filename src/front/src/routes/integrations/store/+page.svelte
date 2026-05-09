<script>
    import { onMount, tick } from 'svelte';

    // Variables de estado (Svelte 5)
    let misDatosBolsa = $state([]);
    let productosDatos = $state([]);
    let cargando = $state(true);
    let errorCarga = $state(false);
    
    // Referencia directa al elemento del DOM
    let contenedorGrafica = $state(null);

    onMount(async () => {
        try {
            // 1. Cargamos ApexCharts dinámicamente
            const ApexChartsModule = await import('apexcharts');
            const ApexCharts = ApexChartsModule.default || ApexChartsModule;

            // 2. Cargamos los datos
            await cargarYDibujar(ApexCharts);
        } catch (e) {
            console.error("Error al inicializar ApexCharts:", e);
            errorCarga = true;
            cargando = false;
        }
    });

    async function cargarYDibujar(ApexCharts) {
        try {
            // Peticiones en paralelo para ganar velocidad
            const [resBolsa, resStore] = await Promise.all([
                fetch('/api/v1/daily-global-stock-market-indicators'),
                fetch('/api/v1/proxy/store')
            ]);

            if (!resBolsa.ok || !resStore.ok) throw new Error("Error en las APIs");

            misDatosBolsa = await resBolsa.json();
            productosDatos = await resStore.json();

            // Procesar datos para la gráfica
            let categorias = [];
            let serieBolsa = [];
            let serieProducto = [];
            const limite = Math.min(misDatosBolsa.length, productosDatos.length, 5);

            for (let i = 0; i < limite; i++) {
                categorias.push(`${misDatosBolsa[i].index_name} / ${productosDatos[i].title.substring(0, 10)}...`);
                // Redondeamos el volumen para que quede limpio en millones
                serieBolsa.push(Math.round(misDatosBolsa[i].volume / 1000000));
                // Precios de la tienda
                serieProducto.push(productosDatos[i].price);
            }

            cargando = false;
            
            // CRUCIAL: Esperamos a que Svelte cree el DIV en el DOM
            await tick();

            // Verificamos que el contenedor exista antes de pintar
            if (contenedorGrafica && categorias.length > 0) {
                const opciones = {
                    series: [{
                        name: 'Volumen Bolsa (M)',
                        type: 'column', // Tipo barra para el volumen
                        data: serieBolsa
                    }, {
                        name: 'Precio Producto ($)',
                        type: 'line', // Tipo línea para el precio
                        data: serieProducto
                    }],
                    chart: {
                        height: 500,
                        type: 'line', // El contenedor general es de tipo line
                        fontFamily: 'sans-serif',
                        toolbar: {
                            show: true
                        }
                    },
                    stroke: {
                        width: [0, 4] // Sin borde para las barras, 4px de grosor para la línea
                    },
                    title: {
                        text: 'Comparativa Bolsa vs Tienda (ApexCharts)',
                        align: 'center'
                    },
                    colors: ['#2a9d8f', '#e9c46a'],
                    xaxis: {
                        categories: categorias
                    },
                    yaxis: [
                        {
                            title: { text: 'Volumen (Millones)' },
                        }, 
                        {
                            opposite: true, // Ponemos el eje del precio a la derecha
                            title: { text: 'Precio ($)' }
                        }
                    ],
                    tooltip: {
                        shared: true,
                        intersect: false
                    }
                };

                const chart = new ApexCharts(contenedorGrafica, opciones);
                chart.render();
            }
        } catch (error) {
            console.error("Error cargando datos:", error);
            errorCarga = true;
            cargando = false;
        }
    }
</script>

<main style="padding: 20px; font-family: sans-serif; max-width: 900px; margin: 0 auto;">
    <h2>🛒 Integración: Mi API Bolsa + FakeStore API</h2>
    <p>Visualización <strong>Mixta (Barra + Línea) con doble eje</strong> usando <strong>ApexCharts</strong>.</p>

    {#if errorCarga}
        <div style="background: #fee; color: #c00; padding: 10px; border-radius: 5px;">
            ⚠️ <strong>Error:</strong> No se han podido cargar los datos. 
            Asegúrate de que el backend está corriendo.
        </div>
    {/if}

    {#if cargando}
        <div style="text-align: center; padding: 40px; color: #666;">
            <p>⏳ Cargando datos y generando gráfica...</p>
        </div>
    {/if}

    <div 
        bind:this={contenedorGrafica} 
        style="width: 100%; margin-top: 20px; {cargando ? 'display:none' : 'display:block'}"
    ></div>

    <br>
    <a href="/integrations" style="display: inline-block; margin-top: 20px; text-decoration: none; color: #007bff; font-weight: bold;">⬅ Volver a Integraciones</a>
</main>