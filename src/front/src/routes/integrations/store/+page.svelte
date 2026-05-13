<script>
    import { onMount, tick } from 'svelte';

    // Variables de estado (Svelte 5)
    let misDatosBolsa = $state([]);
    let productosDatos = $state([]);
    let cargando = $state(true);
    let errorCarga = $state(false);
    
    // Referencia directa al elemento del DOM para ApexCharts
    let contenedorGrafica = $state(null);

    onMount(async () => {
        try {
            // 1. Cargamos ApexCharts dinámicamente para evitar errores de SSR
            const ApexChartsModule = await import('apexcharts');
            const ApexCharts = ApexChartsModule.default || ApexChartsModule;

            // 2. Cargamos los datos de las APIs y dibujamos
            await cargarYDibujar(ApexCharts);
        } catch (e) {
            console.error("Error al inicializar ApexCharts:", e);
            errorCarga = true;
            cargando = false;
        }
    });

    async function cargarYDibujar(ApexCharts) {
        try {
            // Peticiones en paralelo. 
            // IMPORTANTE: He cambiado 'dummyjson' por 'store' para que coincida con tu backend
            const [resBolsa, resStore] = await Promise.all([
                fetch('/api/v1/daily-global-stock-market-indicators'),
                fetch('/api/v1/proxy/store') 
            ]);

            if (!resBolsa.ok || !resStore.ok) {
                throw new Error(`Error en las APIs: Bolsa(${resBolsa.status}) Tienda(${resStore.status})`);
            }

            // Guardamos datos de la bolsa
            misDatosBolsa = await resBolsa.json();
            
            // Procesamos respuesta de DummyJSON (viene dentro de .products)
            const datosStoreRespuesta = await resStore.json();
            productosDatos = datosStoreRespuesta.products;

            // Verificamos que ambos tengan datos antes de seguir
            if (!Array.isArray(misDatosBolsa) || !Array.isArray(productosDatos)) {
                throw new Error("El formato de los datos recibidos no es un array válido");
            }

            // Preparar arrays para la gráfica
            let categorias = [];
            let serieBolsa = [];
            let serieProducto = [];
            
            // Limitamos a 5 elementos para que la gráfica no se amontone
            const limite = Math.min(misDatosBolsa.length, productosDatos.length, 5);

            for (let i = 0; i < limite; i++) {
                // Eje X: Nombre del índice + Nombre del producto (recortado)
                categorias.push(`${misDatosBolsa[i].index_name} / ${productosDatos[i].title.substring(0, 10)}...`);
                
                // Serie 1: Volumen de bolsa (en millones para que la escala sea manejable)
                serieBolsa.push(Math.round(misDatosBolsa[i].volume / 1000000));
                
                // Serie 2: Precio de DummyJSON
                serieProducto.push(productosDatos[i].price);
            }

            cargando = false;
            
            // Esperamos a que Svelte actualice el DOM y el div 'contenedorGrafica' exista
            await tick();

            if (contenedorGrafica && categorias.length > 0) {
                const opciones = {
                    series: [{
                        name: 'Volumen Bolsa (M)',
                        type: 'column',
                        data: serieBolsa
                    }, {
                        name: 'Precio Producto ($)',
                        type: 'line',
                        data: serieProducto
                    }],
                    chart: {
                        height: 500,
                        type: 'line',
                        fontFamily: 'Arial, sans-serif',
                        toolbar: { show: true }
                    },
                    stroke: {
                        width: [0, 4] // 0 para barras, 4px para la línea
                    },
                    title: {
                        text: 'Comparativa: Mi Bolsa vs DummyJSON Store',
                        align: 'center',
                        style: { fontSize: '20px' }
                    },
                    colors: ['#2a9d8f', '#e9c46a'],
                    xaxis: {
                        categories: categorias
                    },
                    yaxis: [
                        {
                            title: { text: 'Volumen (Millones de $)' },
                        }, 
                        {
                            opposite: true, // Eje de precio a la derecha
                            title: { text: 'Precio Producto ($)' }
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
            console.error("❌ Error cargando datos en el frontend:", error);
            errorCarga = true;
            cargando = false;
        }
    }
</script>

<main style="padding: 20px; font-family: sans-serif; max-width: 1000px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h2>🛒 Integración Real: API Bolsa + DummyJSON</h2>
        <p>Consumiendo datos externos a través de un <strong>Proxy Seguro</strong> en el Backend.</p>
    </div>

    {#if errorCarga}
        <div style="background: #fff5f5; color: #c53030; padding: 20px; border: 1px solid #feb2b2; border-radius: 8px; text-align: center;">
            <p>⚠️ <strong>¡Ups! Algo ha fallado:</strong></p>
            <p>No se han podido cargar los datos. Revisa que el Backend esté desplegado en Render y que las rutas coincidan.</p>
        </div>
    {/if}

    {#if cargando && !errorCarga}
        <div style="text-align: center; padding: 50px;">
            <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; margin: 0 auto;"></div>
            <p style="margin-top: 15px; color: #666;">Obteniendo datos de los servidores...</p>
        </div>
    {/if}

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
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
</style>