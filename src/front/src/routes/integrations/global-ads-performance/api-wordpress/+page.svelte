<script>
    import { onMount, tick } from 'svelte';

    let canvasElement = $state();
    let chartInstance = $state();
    let autenticado = $state(true);
    let errorCarga = $state("");

    // Aquí debes poner la URL de tu sitio de WordPress (ej: misitio.wordpress.com)
    const SITE_DOMAIN = 'davidsos2526.wordpress.com'; 

    onMount(async () => {
        // 1. Comprobamos si tenemos el token en el navegador
        const wpToken = localStorage.getItem('wp_token');
        if (!wpToken) {
            autenticado = false;
            return;
        }

try {
            const { Chart, registerables } = await import('chart.js');
            Chart.register(...registerables);

            // 2. FETCH A TUS ADS
            const resAds = await fetch('https://sos2526-23.onrender.com/api/v2/global-ads-performance');
            const adsData = await resAds.json();

            // 3. FETCH DIRECTO A WORDPRESS (¡CORREGIDO A /visits!)
            // Ahora llamamos a nuestro propio servidor SvelteKit, pasándole el token
            const resWp = await fetch(`/integrations/global-ads-performance/api-wordpress`, {
                headers: { 'Authorization': `Bearer ${wpToken}` }
            });

            // Seguro anti-crasheos de JSON
            if (!resWp.ok) {
                throw new Error(`WordPress rechazó la petición: Error ${resWp.status}`);
            }

            const wpData = await resWp.json();

            // 4. CRUZAMOS LOS DATOS
            // La API de WordPress devuelve 'wpData.data' como un array de arrays: 
            // Ejemplo: [ ["2024-10-15", 5, 2], ["2024-10-16", 12, 8] ] -> [Fecha, Vistas, Visitantes]
            const vistasPorFecha = {};
            if (wpData.data) {
                wpData.data.forEach(fila => {
                    vistasPorFecha[fila[0]] = fila[1]; // Clave: Fecha, Valor: Número de Vistas
                });
            }

            const fechas = [...new Set(adsData.map(ad => ad.date.split('T')[0]))].sort();
            
            const gastoAds = [];
            const visitasOrganicas = [];

            fechas.forEach(fecha => {
                // Sumamos gasto de tus Ads
                const sumaAds = adsData
                    .filter(ad => ad.date.split('T')[0] === fecha)
                    .reduce((sum, ad) => sum + Number(ad.ad_spend || 0), 0);
                gastoAds.push(sumaAds);

                // Sacamos visitas del blog para ese día. Si no hay datos, ponemos 0.
                visitasOrganicas.push(vistasPorFecha[fecha] || 0);
            });

            await tick();

            // 5. PINTAMOS GRÁFICO DE ÁREAS CON DOBLE EJE
            chartInstance = new Chart(canvasElement, {
                type: 'line',
                data: {
                    labels: fechas,
                    datasets: [
                        {
                            label: '💸 Inversión Ads (USD)',
                            data: gastoAds,
                            borderColor: '#36a2eb',
                            backgroundColor: 'rgba(54, 162, 235, 0.4)',
                            fill: true,
                            tension: 0.4,
                            yAxisID: 'y',
                            order: 2
                        },
                        {
                            label: '👀 Visitas Orgánicas (WP)',
                            data: visitasOrganicas,
                            borderColor: '#ff7a59',
                            backgroundColor: 'rgba(255, 122, 89, 0.4)',
                            fill: true,
                            tension: 0.4,
                            yAxisID: 'y1',
                            order: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                        title: { display: true, text: 'Efecto Halo: Inversión Pagada vs Tráfico Orgánico', font: { size: 16 } }
                    },
                    scales: {
                        y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Gasto Publicitario (USD)' } },
                        y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Nº de Visitas Reales' }, grid: { drawOnChartArea: false } }
                    }
                }
            });

        } catch (error) {
            errorCarga = "Error cargando los datos: " + error.message;
        }
    });
</script>

<main style="padding: 2rem; max-width: 1000px; margin: 0 auto; font-family: sans-serif;">
    {#if !autenticado}
        <div style="text-align: center; border: 2px dashed #0087be; padding: 3rem; border-radius: 10px;">
            <h2>📝 Conectar con WordPress</h2>
            <button onclick={() => window.location.href='/auth/wordpress/login'} 
                    style="background: #0087be; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
                Login con WordPress
            </button>
        </div>
    {:else if errorCarga}
        <p style="color: red;">{errorCarga}</p>
    {:else}
        <div style="background: white; padding: 1rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="position: relative; height: 400px; width: 100%;">
                <canvas bind:this={canvasElement}></canvas>
            </div>
        </div>
    {/if}
</main>