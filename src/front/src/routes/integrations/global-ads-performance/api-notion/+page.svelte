<script>
    import { onMount, tick } from 'svelte';
    let canvasElement = $state();
    let chartInstance = $state();
    let errorCarga = $state("");

    onMount(async () => {
        try {
            const { Chart, registerables } = await import('chart.js');
            Chart.register(...registerables);

            // 1. Fetch a tus Ads (Render)
            const resAds = await fetch('https://sos2526-23.onrender.com/api/v2/global-ads-performance');
            const adsData = await resAds.json();

            // 2. Fetch a tu Proxy de Notion
            const resNotion = await fetch('/integrations/global-ads-performance/api-notion', { method: 'POST' });
            
            if (!resNotion.ok) {
                const errorData = await resNotion.json();
                throw new Error(errorData.details?.message || "Notion rechazó el Token (Error 401)");
            }

            const notionRows = await resNotion.json();

            // 3. Mapear datos de Notion
            const leadsPorFecha = {};
            notionRows.forEach(row => {
                const fecha = row.properties.Fecha?.date?.start;
                const leads = row.properties.Leads?.number || 0;
                if (fecha) leadsPorFecha[fecha] = leads;
            });

            // 4. Fechas (Eje X) - Filtramos desde septiembre para no tener 8 meses vacíos
            const fechas = [...new Set(adsData.map(ad => ad.date.split('T')[0]))]
                            .filter(f => f >= '2024-09-01')
                            .sort();
                            
            const gastoAds = [];
            const leadsNotionBurbujas = [];

            fechas.forEach(fecha => {
                // Preparamos las Barras (Ads)
                const sumaAds = adsData
                    .filter(ad => ad.date.split('T')[0] === fecha)
                    .reduce((sum, ad) => sum + Number(ad.ad_spend || 0), 0);
                gastoAds.push(sumaAds);
                
                // Preparamos las Burbujas (Notion)
                const leads = leadsPorFecha[fecha] || 0;
                leadsNotionBurbujas.push({
                    x: fecha,
                    y: leads,
                    r: leads > 0 ? 8 : 0 // Si no hay leads, la burbuja es invisible
                });
            });

            await tick();

            // 5. Pintar la Gráfica Mixta (Barras + Burbujas)
            chartInstance = new Chart(canvasElement, {
                type: 'bar',
                data: {
                    labels: fechas,
                    datasets: [
                        {
                            type: 'bar',
                            label: '💸 Inversión Ads (API Propia)',
                            data: gastoAds,
                            backgroundColor: 'rgba(54, 162, 235, 0.6)',
                            borderRadius: 4,
                            yAxisID: 'y'
                        },
                        {
                            type: 'bubble',
                            label: '📈 Leads CRM (API Notion)',
                            data: leadsNotionBurbujas,
                            backgroundColor: 'rgba(255, 122, 89, 0.9)',
                            borderColor: 'white',
                            borderWidth: 2,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    if (context.dataset.type === 'bar') {
                                        return `Gasto Ads: $${context.raw.toFixed(2)}`;
                                    } else {
                                        return `Leads Notion: ${context.raw.y}`;
                                    }
                                }
                            }
                        }
                    },
                    scales: {
                        y: { 
                            type: 'linear', 
                            position: 'left', 
                            title: { display: true, text: 'Gasto Diario (USD)' },
                            beginAtZero: true 
                        },
                        y1: { 
                            type: 'linear', 
                            position: 'right', 
                            title: { display: true, text: 'Nº de Leads' },
                            beginAtZero: true, 
                            grid: { drawOnChartArea: false } 
                        }
                    }
                }
            });
        } catch (e) { 
            errorCarga = "Error cargando los datos: " + e.message; 
        }
    });
</script>

<div style="height: 550px; width: 100%; padding: 20px; box-sizing: border-box;">
    {#if errorCarga} 
        <p style="color: red; font-weight: bold; text-align: center;">{errorCarga}</p> 
    {:else}
        <div style="height: 450px; width: 100%;">
            <canvas bind:this={canvasElement}></canvas>
        </div>

        <div style="margin-top: 20px; text-align: center; border-top: 1px solid #eee; padding-top: 15px;">
            <p style="font-style: italic; color: #333; font-size: 1.15rem; font-weight: 500; margin: 0;">
                "¿Gastar más dinero en anuncios nos ha traído más clientes reales?"
            </p>
            <p style="font-size: 0.85rem; color: #777; margin-top: 5px;">
                Cruce de datos en tiempo real entre <strong>Render API</strong> y <strong>Notion CRM</strong>
            </p>
        </div>
    {/if}
</div>