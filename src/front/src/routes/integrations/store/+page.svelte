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
            // 1. Cargamos las librerías dinámicamente
            const HighchartsModule = await import('highcharts');
            const Highcharts = HighchartsModule.default || HighchartsModule;
            
            const AccessibilityModule = await import('highcharts/modules/accessibility');
            const Accessibility = AccessibilityModule.default || AccessibilityModule;
            
            // Inicializamos el módulo de accesibilidad
            if (typeof Accessibility === 'function') {
                Accessibility(Highcharts);
            }

            // 2. Cargamos los datos
            await cargarYDibujar(Highcharts);
        } catch (e) {
            console.error("Error al inicializar:", e);
            errorCarga = true;
            cargando = false;
        }
    });

    async function cargarYDibujar(Highcharts) {
        try {
            // Peticiones en paralelo para ganar velocidad
            const [resBolsa, resStore] = await Promise.all([
                fetch('http://localhost:3000/api/v1/daily-global-stock-market-indicators'),
                fetch('http://localhost:3000/api/v1/proxy/store')
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
                serieBolsa.push(misDatosBolsa[i].volume / 1000000);
                serieProducto.push(productosDatos[i].price);
            }

            cargando = false;
            
            // CRUCIAL: Esperamos a que Svelte cree el DIV en el DOM
            await tick();

            // Verificamos que el contenedor exista antes de pintar (Evita Error #13)
            if (contenedorGrafica && categorias.length > 0) {
                Highcharts.chart(contenedorGrafica, {
                    chart: { type: 'column' },
                    title: { text: 'Comparativa Bolsa vs Tienda' },
                    xAxis: { categories: categorias },
                    yAxis: [
                        { title: { text: 'Volumen (M)' } },
                        { title: { text: 'Precio ($)' }, opposite: true }
                    ],
                    series: [
                        { name: 'Volumen Bolsa', data: serieBolsa, color: '#2a9d8f' },
                        { name: 'Precio Producto', data: serieProducto, color: '#e9c46a', yAxis: 1 }
                    ]
                });
            }
        } catch (error) {
            console.error("Error cargando datos:", error);
            errorCarga = true;
            cargando = false;
        }
    }
</script>

<main style="padding: 20px; font-family: sans-serif;">
    <h2>Integración: Mi API Bolsa + FakeStore API</h2>

    {#if errorCarga}
        <div style="background: #fee; color: #c00; padding: 10px; border-radius: 5px;">
            ⚠️ <strong>Error:</strong> No se han podido cargar los datos. 
            Asegúrate de que el backend en el puerto 3000 está corriendo.
        </div>
    {/if}

    {#if cargando}
        <p>⏳ Cargando datos y generando gráfica...</p>
    {/if}

    <div 
        bind:this={contenedorGrafica} 
        style="width: 100%; height: 500px; margin-top: 20px; {cargando ? 'display:none' : 'display:block'}"
    ></div>
</main>