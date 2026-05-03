<script>
    import { onMount } from 'svelte';

    let errorMessage = "";

    onMount(async () => {
        try {
            // 1. Pedimos los datos al Proxy de Twitch
            const resTwitch = await fetch('/api/v1/proxy/twitch');
            if (!resTwitch.ok) throw new Error("Error al obtener datos del proxy de Twitch");
            const twitchData = await resTwitch.json();

            // 2. Pedimos los datos a tu API (Bursátil)
            const resOwn = await fetch('/api/v1/daily-global-stock-market-indicators');
            if (!resOwn.ok) throw new Error("Error al obtener datos propios");
            const ownData = await resOwn.json();

            // 3. Preparamos los datos para Plotly Scatter
            const valoresX_Propios = [];
            const valoresY_Twitch = [];
            const nombresHover = [];

            // Mezclamos 5 elementos
            for (let i = 0; i < 5; i++) {
                if (twitchData[i] && ownData[i]) {
                    // Eje X: Valor de cierre de tu API
                    valoresX_Propios.push(ownData[i].close);
                    
                    // Eje Y: Métrica de Twitch (usamos un fragmento del ID del juego como métrica numérica)
                    valoresY_Twitch.push(parseInt(twitchData[i].id.substring(0, 4))); 
                    
                    // Texto al pasar el ratón: Nombre del juego + Índice
                    nombresHover.push(`Juego: ${twitchData[i].name} <br> Índice: ${ownData[i].index_name}`);
                }
            }

            // 4. Configuración de Plotly Scatter
            const traza = {
                x: valoresX_Propios,
                y: valoresY_Twitch,
                mode: 'markers',
                type: 'scatter',
                text: nombresHover,
                marker: { 
                    size: 15, 
                    color: '#9146FF', // Color morado de Twitch
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

            // Dibujamos la gráfica
            Plotly.newPlot('plotly-chart', [traza], layout);

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

    <div id="plotly-chart" style="width: 100%; height: 500px; margin-top: 2rem; border: 1px solid #ddd; border-radius: 8px;"></div>

    <br>
    <a href="/integrations" style="display: inline-block; margin-top: 20px; text-decoration: none; color: #007bff; font-weight: bold;">⬅ Volver a Integraciones</a>
</main>