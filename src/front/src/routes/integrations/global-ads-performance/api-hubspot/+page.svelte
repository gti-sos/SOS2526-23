<script>
    import { onMount, tick } from 'svelte';

    // ==========================================
    // ESTADOS DEL WIDGET (Svelte 5)
    // ==========================================
    let canvasElement = $state(); 
    let chartInstance = $state();
    
    let autenticado = $state(true);
    let cargando = $state(true);
    let errorCarga = $state("");

    // Datos maestros extraídos del JSON
    let datosCompletos = $state([]); 
    
    // Controles de interactividad
    let diasTotales = $state(0);
    let diasMostrar = $state(7); // Por defecto mostramos los últimos 7 días
    
    // Tarjetas de Resumen
    let totalAds = $state(0);
    let totalVentas = $state(0);

    // ==========================================
    // LÓGICA DE INTERACTIVIDAD DEL WIDGET
    // ==========================================
    const actualizarWidget = () => {
        if (!chartInstance || datosCompletos.length === 0) return;

        // 1. Filtramos los datos para mostrar solo los últimos 'N' días elegidos en el slider
        const datosFiltrados = datosCompletos.slice(-diasMostrar);

        // 2. Recalculamos las tarjetas superiores
        totalAds = datosFiltrados.reduce((sum, d) => sum + d.ads, 0);
        totalVentas = datosFiltrados.reduce((sum, d) => sum + d.ventas, 0);

        // 3. Actualizamos la gráfica de barras
        chartInstance.data.labels = datosFiltrados.map(d => d.fecha);
        chartInstance.data.datasets[0].data = datosFiltrados.map(d => d.ads);
        chartInstance.data.datasets[1].data = datosFiltrados.map(d => d.ventas);
        chartInstance.update();
    };

    // ==========================================
    // CARGA DE DATOS (NUEVA ARQUITECTURA PROXY PIPE)
    // ==========================================
    onMount(async () => {
        try {
            const { Chart, registerables } = await import('chart.js');
            Chart.register(...registerables);

            // 1. Extraer el token de HubSpot de las cookies del navegador
            const getCookie = (name) => {
                const value = `; ${document.cookie}`;
                const parts = value.split(`; ${name}=`);
                if (parts.length === 2) return parts.pop().split(';').shift();
                return null;
            };
            const token = getCookie('hubspot_token');

            if (!token) {
                autenticado = false;
                cargando = false;
                return;
            }

            // 2. Llamada directa a Render (Ads)
            const resAds = await fetch('https://sos2526-23.onrender.com/api/v2/global-ads-performance');
            if (!resAds.ok) throw new Error("Fallo al obtener datos de Ads");
            const ads = await resAds.json();

            // 3. Llamada a HubSpot a través del Proxy "Tubo" en Express
            const baseProxy = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';
            const hubspotUrl = `${baseProxy}/api/proxy-hubspot/crm/v3/objects/deals?properties=amount,closedate,dealname`;

            const resHubspot = await fetch(hubspotUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (resHubspot.status === 401) { 
                autenticado = false;
                cargando = false;
                return;
            }
            if (!resHubspot.ok) throw new Error("Error al comunicarse con HubSpot mediante el proxy");

            const hubspotData = await resHubspot.json();
            const sales = hubspotData.results || [];

            // ==========================================
            // NORMALIZACIÓN Y COMBINACIÓN DE DATOS
            // ==========================================
            const limpiarFecha = (fecha) => fecha ? fecha.split('T')[0] : null;

            // Sacamos todas las fechas únicas
            const fechasExtraidas = [
                ...ads.map(ad => limpiarFecha(ad.date)),
                ...sales.map(deal => limpiarFecha(deal.properties.closedate))
            ].filter(Boolean); // Quitamos nulos
            
            const fechasUnicas = [...new Set(fechasExtraidas)].sort();

            // Formateamos los datos para que el widget los digiera fácilmente
            datosCompletos = fechasUnicas.map(fecha => {
                const sumaAds = ads
                    .filter(ad => limpiarFecha(ad.date) === fecha)
                    .reduce((sum, ad) => sum + Number(ad.ad_spend || 0), 0);
                    
                const sumaVentas = sales
                    .filter(deal => limpiarFecha(deal.properties.closedate) === fecha)
                    .reduce((sum, deal) => sum + Number(deal.properties.amount || 0), 0);
                
                return { fecha, ads: sumaAds, ventas: sumaVentas };
            });

            diasTotales = datosCompletos.length;
            if (diasMostrar > diasTotales) diasMostrar = diasTotales;

            cargando = false;
            await tick();

            // Inicializamos el gráfico
            chartInstance = new Chart(canvasElement, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [
                        { label: 'Inversión Ads (Spend)', data: [], backgroundColor: '#36a2eb', borderRadius: 4 },
                        { label: 'Ventas CRM (Ingreso)', data: [], backgroundColor: '#4bc0c0', borderRadius: 4 }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { tooltip: { mode: 'index', intersect: false } }
                }
            });

            // Llenamos el widget con los datos iniciales
            actualizarWidget();

        } catch (error) {
            errorCarga = error.message;
            cargando = false;
        }
    });
</script>

<main class="widget-container">
    {#if !autenticado}
        <div class="auth-box">
            <h2>📈 Conexión con Ventas</h2>
            <p>Conecta tu CRM para habilitar el widget de analítica de conversiones.</p>
            <button onclick={() => window.location.href = '/auth/hubspot/login'} class="btn-hubspot">
                Conectar con HubSpot
            </button>
        </div>

    {:else if errorCarga}
        <p style="color: #d32f2f; text-align: center;"><strong>Error:</strong> {errorCarga}</p>

    {:else if cargando}
        <div style="text-align: center; padding: 4rem;">
            <p style="font-size: 18px; color: #ff7a59; font-weight: bold;">🔄 Inicializando Widget de HubSpot...</p>
        </div>

    {:else}
        <div class="widget">
            
            <div class="cards-grid">
                <div class="card">
                    <h4>Inversión Total (Ads)</h4>
                    <strong class="text-blue">{Math.round(totalAds).toLocaleString()} USD</strong>
                </div>
                <div class="card">
                    <h4>Total Ventas (HubSpot)</h4>
                    <strong class="text-green">{Math.round(totalVentas).toLocaleString()} USD</strong>
                </div>
            </div>

            <div class="slider-control">
                <label for="dias">
                    <strong>Rango de análisis:</strong> Mostrando los últimos {diasMostrar} días
                </label>
                <input 
                    type="range" 
                    id="dias" 
                    min="1" 
                    max={diasTotales} 
                    bind:value={diasMostrar} 
                    oninput={actualizarWidget}
                    class="range-slider"
                />
            </div>

            <div class="chart-wrapper">
                <canvas bind:this={canvasElement}></canvas>
            </div>
            
        </div>
    {/if}
</main>

<style>
    .widget-container {
        padding: 2rem;
        max-width: 1000px;
        margin: 0 auto;
        font-family: sans-serif;
    }
    .widget {
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 8px 16px rgba(0,0,0,0.05);
    }
    .cards-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        margin-bottom: 2rem;
    }
    .card {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        text-align: center;
    }
    .card h4 { margin: 0 0 10px 0; color: #555; }
    .text-blue { font-size: 28px; color: #36a2eb; }
    .text-green { font-size: 28px; color: #4bc0c0; }
    
    .slider-control {
        margin-bottom: 2rem;
        text-align: center;
        background: white;
        padding: 1rem;
        border-radius: 8px;
    }
    .range-slider {
        width: 100%;
        max-width: 400px;
        margin-top: 10px;
        cursor: pointer;
    }

    .chart-wrapper {
        position: relative;
        height: 400px;
        width: 100%;
        background: white;
        padding: 1rem;
        border-radius: 8px;
    }

    .auth-box {
        text-align: center; 
        padding: 4rem; 
        border: 2px dashed #ff7a59; 
        border-radius: 15px;
    }
    .btn-hubspot {
        background: #ff7a59;
        color: white;
        padding: 14px 28px;
        border: none;
        border-radius: 8px;
        font-weight: bold;
        font-size: 16px;
        cursor: pointer;
        transition: 0.3s;
    }
    .btn-hubspot:hover { background: #e06246; }
</style>