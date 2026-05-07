<script>
    import { onMount } from 'svelte';

    let errorMessage = "";
    let debugInfo = "";

    onMount(async () => {
        try {
            // 1. Pedimos los datos al Proxy de Twitch
            const resTwitch = await fetch('/api/v1/proxy/twitch');
            const twitchRaw = await resTwitch.json();

            // Debug: muestra qué devuelve el proxy
            debugInfo = `Twitch status: ${resTwitch.status} | Data: ${JSON.stringify(twitchRaw)?.substring(0, 200)}`;

            if (!resTwitch.ok) throw new Error(`Error proxy Twitch (${resTwitch.status}): ${JSON.stringify(twitchRaw)}`);
            if (!Array.isArray(twitchRaw) || twitchRaw.length === 0) {
                throw new Error(`Twitch devolvió datos vacíos o incorrectos: ${JSON.stringify(twitchRaw)}`);
            }
            const twitchData = twitchRaw;

            // 2. Pedimos los datos a la API Bursátil
            const resOwn = await fetch('/api/v1/daily-global-stock-market-indicators');
            if (!resOwn.ok) throw new Error(`Error API bursátil (${resOwn.status})`);
            const ownData = await resOwn.json();

            if (!Array.isArray(ownData) || ownData.length === 0) {
                throw new Error(`API bursátil devolvió datos vacíos`);
            }

            // 3. Preparamos los datos para Plotly Scatter
            const valoresX_Propios = [];
            const valoresY_Twitch = [];
            const nombresHover = [];

            for (let i = 0; i < 5; i++) {
                if (twitchData[i] && ownData[i]) {
                    valoresX_Propios.push(ownData[i].close);
                    valoresY_Twitch.push(parseInt(twitchData[i].id.substring(0, 4)));
                    nombresHover.push(`Juego: ${twitchData[i].name} <br> Índice: ${ownData[i].index_name}`);
                }
            }

            if (valoresX_Propios.length === 0) {
                throw new Error("No se pudieron combinar datos de ambas APIs");
            }

            // 4. Configuración de Plotly Scatter
            const traza = {
                x: valoresX_Propios,
                y: valoresY_Twitch,
                mode: 'markers',
                type: 'scatter',
                text: nombresHover,
                hoverinfo: 'text',
                marker: {
                    size: 15,
                    color: '#9146FF',
                    line: { width: 2, color: 'DarkSlateGrey' }
                },
                name: 'Integración'
            };

            const layout = {
                title: 'Dispersión: Cierre Bursátil vs Top Juegos Twitch',
                xaxis: { title: 'Precio de Cierre (Mi API)' },
                yaxis: { title: 'Métrica Twitch (ID Truncado)' },
                hovermode: 'closest'
            };

            Plotly.newPlot('plotly-chart', [traza], layout);
            debugInfo = ""; // Limpiamos debug si todo fue bien

        } catch (error) {
            console.error(error);
            errorMessage = error.message;
        }
    });
</script>

<svelte:head>
    <script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>
</svelte:head>

<main style="padding: 2rem; max-width: 900px; margin: 0 auto; font-family: sans-serif;">
    <h2 style="color: #9146FF;">🎮 Integración con Twitch API (OAuth)</h2>
    <p>Visualización tipo <strong>Scatter (Plotly)</strong> combinando nuestra API bursátil con el Top 5 de Juegos de Twitch consumido mediante Proxy seguro.</p>

    {#if errorMessage}
        <div style="background: #ffebee; color: #c62828; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
            <strong>¡Ups! Error:</strong> {errorMessage}
        </div>
    {/if}

    {#if debugInfo}
        <div style="background: #fff3e0; color: #e65100; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.85rem; word-break: break-all;">
            <strong>🔍 Debug:</strong> {debugInfo}
        </div>
    {/if}

    <div id="plotly-chart" style="width: 100%; height: 500px; margin-top: 2rem; border: 1px solid #ddd; border-radius: 8px;"></div>

    <br>
    <a href="/integrations" style="display: inline-block; margin-top: 20px; text-decoration: none; color: #007bff; font-weight: bold;">⬅ Volver a Integraciones</a>
</main>