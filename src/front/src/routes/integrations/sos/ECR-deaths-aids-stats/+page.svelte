<script>
    import { onMount, tick } from 'svelte';
    // ⚠️ NO importamos billboard.js aquí, lo cargamos por CDN abajo en <svelte:head>

    let cargando = $state(true);
    let errorCarga = $state(false);
    let contenedorGrafica = $state(null);

    onMount(async () => {
        try {
            // Peticiones en paralelo
            const [resBolsa, resSos] = await Promise.all([
                fetch('/api/v1/daily-global-stock-market-indicators'),
                fetch('/api/v1/proxy/sos-aids')
            ]);

            if (!resBolsa.ok || !resSos.ok) {
                throw new Error(`Error en las APIs - Bolsa: ${resBolsa.status}, Compi: ${resSos.status}`);
            }

            const misDatosBolsaBrutos = await resBolsa.json();
            const datosCompiBrutos = await resSos.json();

            // 🕵️‍♂️ CHIVATOS PARA LA CONSOLA (F12)
            console.log("👀 Datos brutos de MI bolsa:", misDatosBolsaBrutos);
            console.log("👀 Datos brutos del COMPI:", datosCompiBrutos);

            // =========================================================
            // 🛡️ LÓGICA DE EXTRACCIÓN SEGURA (El arreglo principal)
            // =========================================================
            
            // 1. Asegurar mis datos
            const misDatosBolsa = Array.isArray(misDatosBolsaBrutos) ? misDatosBolsaBrutos : [];

            // 2. Asegurar los datos del compañero (por si manda un objeto en vez de array)
            let datosCompi = [];
            if (Array.isArray(datosCompiBrutos)) {
                datosCompi = datosCompiBrutos;
            } else if (typeof datosCompiBrutos === 'object' && datosCompiBrutos !== null) {
                // Buscamos dinámicamente el primer array dentro de su objeto de respuesta
                const arrayEncontrado = Object.values(datosCompiBrutos).find(val => Array.isArray(val));
                datosCompi = arrayEncontrado || [];
            }

            console.log("✅ Array final Compi a procesar:", datosCompi);

            if (misDatosBolsa.length === 0 || datosCompi.length === 0) {
                console.warn("⚠️ Atención: Uno de los arrays está vacío. ¿Tiene la base de datos registros?");
                throw new Error("No hay suficientes datos para dibujar la gráfica.");
            }

            // Preparar datos para Billboard.js
            let etiquetas = [];
            let serieBolsa = ['Volumen Bolsa (M)'];
            let serieCompi = ['Estadísticas VIH'];
            
            const limite = Math.min(misDatosBolsa.length, datosCompi.length, 7);

            for (let i = 0; i < limite; i++) {
                etiquetas.push(misDatosBolsa[i].index_name);
                serieBolsa.push(Math.round(misDatosBolsa[i].volume / 1000000));
                
                // Buscamos dinámicamente el primer número en el JSON del compañero
                let valorCompi = 0;
                for (let key in datosCompi[i]) {
                    // Mejorado: comprobamos si es número o si es un string numérico (ej: "150")
                    let posibleNumero = parseFloat(datosCompi[i][key]);
                    if (!isNaN(posibleNumero) && key !== 'year' && key !== 'id') {
                        valorCompi = posibleNumero;
                        break;
                    }
                }
                serieCompi.push(valorCompi);
            }

            cargando = false;
            await tick();

            // Usamos la variable global 'bb' que viene de internet (CDN)
            setTimeout(() => {
                if (contenedorGrafica && etiquetas.length > 0 && window.bb) {
                    window.bb.generate({
                        bindto: contenedorGrafica,
                        data: {
                            columns: [
                                serieBolsa,
                                serieCompi
                            ],
                            types: {
                                "Volumen Bolsa (M)": "bar",
                                "Estadísticas VIH": "area-step"
                            },
                            axes: {
                                "Volumen Bolsa (M)": "y",
                                "Estadísticas VIH": "y2"
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
                                show: true
                            }
                        },
                        title: {
                            text: "Integración SOS: Bolsa vs VIH (Billboard.js)"
                        }
                    });
                }
            }, 500);

        } catch (error) {
            console.error("❌ Error cargando la gráfica:", error);
            errorCarga = true;
            cargando = false;
        }
    });
</script>

<svelte:head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/billboard.js/dist/billboard.min.css" />
    <script src="https://cdn.jsdelivr.net/npm/billboard.js/dist/billboard.pkgd.min.js"></script>
</svelte:head>

<main style="padding: 20px; font-family: sans-serif; max-width: 900px; margin: 0 auto;">
    <h2>🤝 Integración API Compañeros (SOS)</h2>
    <p>Visualización <strong>Mixta (Barra + Area-Step)</strong> usando <strong>Billboard.js (CDN)</strong>.</p>

    {#if errorCarga}
        <div style="background: #fee; color: #c00; padding: 15px; border-radius: 5px; text-align: center;">
            ⚠️ <strong>Error:</strong> No se han podido cargar o cruzar los datos de la API de compañeros.
            <br><small>Abre la consola (F12) para ver los detalles.</small>
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
    <div style="text-align: center;">
        <a href="/integrations" style="display: inline-block; margin-top: 20px; text-decoration: none; color: #007bff; font-weight: bold; padding: 10px 20px; border: 1px solid #007bff; border-radius: 5px;">⬅ Volver a Integraciones</a>
    </div>
</main>