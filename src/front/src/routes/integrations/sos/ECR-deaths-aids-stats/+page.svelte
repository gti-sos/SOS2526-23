<script>
    import { onMount, tick } from 'svelte';
    import 'billboard.js/dist/billboard.css'; // ✨ Ponemos el CSS aquí arriba

    let cargando = $state(true);
    let errorCarga = $state(false);
    let contenedorGrafica = $state(null);

    onMount(async () => {
        try {
            const bbModule = await import('billboard.js');
            const bb = bbModule.default || bbModule.bb;

            // Peticiones en paralelo
            const [resBolsa, resSos] = await Promise.all([
                fetch('/api/v1/daily-global-stock-market-indicators'),
                fetch('/api/v1/proxy/sos-aids')
            ]);

            if (!resBolsa.ok || !resSos.ok) throw new Error("Error en las APIs");

            const misDatosBolsa = await resBolsa.json();
            const datosCompi = await resSos.json();

            // Preparar datos para Billboard.js
            let etiquetas = [];
            let serieBolsa = ['Volumen Bolsa (M)'];
            let serieCompi = ['Estadísticas VIH'];
            
            const limite = Math.min(misDatosBolsa.length, datosCompi.length, 7);

            for (let i = 0; i < limite; i++) {
                etiquetas.push(misDatosBolsa[i].index_name);
                serieBolsa.push(Math.round(misDatosBolsa[i].volume / 1000000));
                
                // Buscamos dinámicamente el primer número en el JSON del compañero (excluyendo años)
                let valorCompi = 0;
                for (let key in datosCompi[i]) {
                    if (typeof datosCompi[i][key] === 'number' && key !== 'year' && key !== 'id') {
                        valorCompi = datosCompi[i][key];
                        break;
                    }
                }
                serieCompi.push(valorCompi);
            }

            cargando = false;
            await tick();

            if (contenedorGrafica && etiquetas.length > 0) {
                bb.generate({
                    bindto: contenedorGrafica,
                    data: {
                        columns: [
                            serieBolsa,
                            serieCompi
                        ],
                        types: {
                            "Volumen Bolsa (M)": "bar",
                            "Estadísticas VIH": "area-step" // Gráfico de área escalonada
                        },
                        axes: {
                            "Volumen Bolsa (M)": "y",
                            "Estadísticas VIH": "y2" // Eje Y secundario
                        },
                        colors: {
                            "Volumen Bolsa (M)": "#1f77b4",
                            "Estadísticas VIH": "#d62728"
                        }
                    },
                    axis: {
                        x: {
                            type: "category",
                            categories: etiquetas
                        },
                        y2: {
                            show: true // Mostramos el segundo eje a la derecha
                        }
                    },
                    title: {
                        text: "Integración SOS: Bolsa vs VIH (Billboard.js)"
                    }
                });
            }
        } catch (error) {
            console.error("Error cargando datos:", error);
            errorCarga = true;
            cargando = false;
        }
    });
</script>

<main style="padding: 20px; font-family: sans-serif; max-width: 900px; margin: 0 auto;">
    <h2>🤝 Integración API Compañeros (SOS)</h2>
    <p>Visualización <strong>Mixta (Barra + Area-Step)</strong> usando <strong>Billboard.js</strong>.</p>

    {#if errorCarga}
        <div style="background: #fee; color: #c00; padding: 10px; border-radius: 5px;">
            ⚠️ <strong>Error:</strong> No se han podido cargar los datos de la API de compañeros.
        </div>
    {/if}

    {#if cargando}
        <div style="text-align: center; padding: 40px; color: #666;">
            <p>⏳ Cargando datos de ambas APIs...</p>
        </div>
    {/if}

    <div 
        bind:this={contenedorGrafica} 
        style="width: 100%; margin-top: 20px; {cargando ? 'display:none' : 'display:block'}"
    ></div>

    <br>
    <a href="/integrations" style="display: inline-block; margin-top: 20px; text-decoration: none; color: #007bff; font-weight: bold;">⬅ Volver a Integraciones</a>
</main>