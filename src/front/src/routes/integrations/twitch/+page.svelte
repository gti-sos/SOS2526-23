<script>
    import { onMount } from 'svelte'; // Importamos onMount para ejecutar código cuando el componente se carga en el navegador

    let errorMessage = ""; // Variable para guardar el mensaje de error si algo falla
    let debugInfo = "";    // Variable para mostrar info de depuración mientras desarrollamos

    onMount(async () => { // Esto se ejecuta automáticamente cuando la página termina de cargar
        try {

            // --- PASO 1: Llamamos a nuestro proxy de Twitch ---
            // No llamamos directamente a Twitch porque necesita OAuth, así que usamos nuestro propio backend como intermediario
            const resTwitch = await fetch('/api/v1/proxy/twitch');
            const twitchRaw = await resTwitch.json(); // Convertimos la respuesta a JSON para poder usarla

            // Guardamos info útil para depurar en caso de que algo vaya mal
            debugInfo = `Twitch status: ${resTwitch.status} | Data: ${JSON.stringify(twitchRaw)?.substring(0, 200)}`;

            // Si el proxy devuelve error HTTP (4xx, 5xx), lanzamos excepción manualmente
            if (!resTwitch.ok) throw new Error(`Error proxy Twitch (${resTwitch.status}): ${JSON.stringify(twitchRaw)}`);

            // Comprobamos que los datos son un array con contenido, por si Twitch devuelve algo raro
            if (!Array.isArray(twitchRaw) || twitchRaw.length === 0) {
                throw new Error(`Twitch devolvió datos vacíos o incorrectos: ${JSON.stringify(twitchRaw)}`);
            }
            const twitchData = twitchRaw; // Renombramos para mayor claridad

            // --- PASO 2: Llamamos a nuestra propia API bursátil ---
            const resOwn = await fetch('/api/v1/daily-global-stock-market-indicators');
            if (!resOwn.ok) throw new Error(`Error API bursátil (${resOwn.status})`);
            const ownData = await resOwn.json(); // Parseamos igual que antes

            // Misma comprobación de seguridad que con Twitch
            if (!Array.isArray(ownData) || ownData.length === 0) {
                throw new Error(`API bursátil devolvió datos vacíos`);
            }

            // --- PASO 3: Preparamos los arrays que Plotly necesita para pintar la gráfica ---
            const valoresX_Propios = []; // Eje X → precio de cierre de bolsa
            const valoresY_Twitch = [];  // Eje Y → métrica derivada del ID de Twitch
            const nombresHover = [];     // Texto que aparece al pasar el ratón por encima de cada punto

            // Cogemos solo los 5 primeros elementos de cada API para no sobrecargar la gráfica
            for (let i = 0; i < 5; i++) {
                if (twitchData[i] && ownData[i]) { // Nos aseguramos de que ambos datos existen antes de usarlos
                    valoresX_Propios.push(ownData[i].close); // El precio de cierre del índice bursátil

                    // Cogemos los 4 primeros caracteres del ID de Twitch y los convertimos a número (algo cutre pero funciona para la demo)
                    valoresY_Twitch.push(parseInt(twitchData[i].id.substring(0, 4)));

                    // El texto del tooltip que verá el usuario al hacer hover sobre el punto
                    nombresHover.push(`Juego: ${twitchData[i].name} <br> Índice: ${ownData[i].index_name}`);
                }
            }

            // Si al final el array sigue vacío, algo fue muy mal al cruzar los datos
            if (valoresX_Propios.length === 0) {
                throw new Error("No se pudieron combinar datos de ambas APIs");
            }

            // --- PASO 4: Configuramos y pintamos la gráfica con Plotly ---

            // Una "traza" en Plotly es básicamente una serie de datos (como una capa del gráfico)
            const traza = {
                x: valoresX_Propios,   // Datos del eje X
                y: valoresY_Twitch,    // Datos del eje Y
                mode: 'markers',       // Queremos puntos, no líneas
                type: 'scatter',       // Tipo de gráfica: dispersión
                text: nombresHover,    // Texto del tooltip por cada punto
                hoverinfo: 'text',     // Le decimos a Plotly que solo muestre nuestro texto personalizado al hacer hover
                marker: {
                    size: 15,                            // Tamaño de los puntos
                    color: '#9146FF',                    // Color morado de Twitch, queda bonito
                    line: { width: 2, color: 'DarkSlateGrey' } // Borde oscuro alrededor de cada punto
                },
                name: 'Integración' // Nombre de la serie que aparece en la leyenda
            };

            // Layout es la configuración visual general de la gráfica (títulos, ejes, etc.)
            const layout = {
                title: 'Dispersión: Cierre Bursátil vs Top Juegos Twitch',
                xaxis: { title: 'Precio de Cierre (Mi API)' },  // Etiqueta del eje X
                yaxis: { title: 'Métrica Twitch (ID Truncado)' }, // Etiqueta del eje Y
                hovermode: 'closest' // Al hacer hover resalta el punto más cercano al ratón
            };

            // Pintamos la gráfica dentro del div con id="plotly-chart"
            Plotly.newPlot('plotly-chart', [traza], layout);

            debugInfo = ""; // Si llegamos aquí es que todo fue bien, limpiamos el debug

        } catch (error) {
            console.error(error);          // Mostramos el error en la consola del navegador
            errorMessage = error.message;  // Lo guardamos para mostrárselo al usuario en pantalla
        }
    });
</script>

<!-- Cargamos la librería de Plotly desde CDN (necesaria para pintar la gráfica) -->
<svelte:head>
    <script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>
</svelte:head>

<main style="padding: 2rem; max-width: 900px; margin: 0 auto; font-family: sans-serif;">
    <h2 style="color: #9146FF;">🎮 Integración con Twitch API (OAuth)</h2>
    <p>Visualización tipo <strong>Scatter (Plotly)</strong> combinando nuestra API bursátil con el Top 5 de Juegos de Twitch consumido mediante Proxy seguro.</p>

    <!-- Solo se muestra si errorMessage tiene contenido -->
    {#if errorMessage}
        <div style="background: #ffebee; color: #c62828; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
            <strong>¡Ups! Error:</strong> {errorMessage}
        </div>
    {/if}

    <!-- Solo se muestra mientras estamos depurando (se limpia si todo va bien) -->
    {#if debugInfo}
        <div style="background: #fff3e0; color: #e65100; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.85rem; word-break: break-all;">
            <strong>🔍 Debug:</strong> {debugInfo}
        </div>
    {/if}

    <!-- Aquí es donde Plotly inyecta la gráfica, el id debe coincidir con el del newPlot() -->
    <div id="plotly-chart" style="width: 100%; height: 500px; margin-top: 2rem; border: 1px solid #ddd; border-radius: 8px;"></div>

    <br>
    <!-- Enlace para volver a la página de integraciones -->
    <a href="/integrations" style="display: inline-block; margin-top: 20px; text-decoration: none; color: #007bff; font-weight: bold;">⬅ Volver a Integraciones</a>
</main>