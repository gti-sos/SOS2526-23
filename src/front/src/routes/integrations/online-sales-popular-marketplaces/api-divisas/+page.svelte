<script>
    import { onMount, tick } from 'svelte';
    import 'c3/c3.css';

    // Estados de Svelte 5
    let cargando = $state(true);
    let errorMensaje = $state("");
    let chartElement = $state();

    // Mapeo de tus regiones a monedas representativas
    const monedasRegion = {
        "Europe": "EUR",
        "Asia": "JPY",
        "Oceania": "AUD",
        "South America": "BRL",
        "Africa": "ZAR",
        "North America": "CAD" 
    };

    onMount(async () => {
        try {
            const { default: c3 } = await import('c3');

            // 1. Llamada a TU API de ventas y a TU PROXY de divisas
            const [resSales, resExchange] = await Promise.all([
                fetch('https://sos2526-23.onrender.com/api/v1/online-sales-popular-marketplaces'),
                fetch('/integrations/online-sales-popular-marketplaces/api-divisas') // Tu proxy local
            ]);

            if (!resSales.ok || !resExchange.ok) throw new Error("Error al obtener datos de los servicios");

            const salesData = await resSales.json();
            const exchangeData = await resExchange.json();

            // 2. Procesar regiones que tienen ventas reales
            const regionesConVentas = [...new Set(salesData.map(d => d.region))];
            
            // 3. Preparar columnas para el Gauge (Tasas de cambio vs USD)
            const columnasC3 = regionesConVentas.map(reg => {
                const moneda = monedasRegion[reg];
                const tasa = exchangeData.rates[moneda] || 1;
                return [`${moneda} (${reg})`, tasa];
            });

            cargando = false;
            await tick();

            // 4. Generación de la gráfica Gauge
            c3.generate({
                bindto: chartElement,
                data: {
                    columns: columnasC3,
                    type: 'gauge'
                },
                gauge: {
                    label: { format: (v) => v.toFixed(2) },
                    min: 0,
                    max: 160, // Ajustado para captar la volatilidad del JPY o BRL
                    units: ' Tasa vs USD'
                },
                color: {
                    pattern: ['#10b981', '#f59e0b', '#ef4444'], // Verde (estable) -> Rojo (devaluado)
                    threshold: { values: [30, 80, 120] }
                }
            });

        } catch (e) {
            errorMensaje = e.message;
            cargando = false;
        }
    });
</script>

<main style="max-width: 1000px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif;">
    <header style="margin-bottom: 2rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 1rem;">
        <h1 style="font-size: 1.75rem; color: #1e293b;">🌐 Monitor de Divisas vs Ventas Online</h1>
        <p style="color: #64748b;">Análisis del impacto cambiario en regiones comerciales mediante proxy propio.</p>
    </header>

    {#if cargando}
        <div style="text-align: center; padding: 4rem;">
            <p style="color: #3b82f6; font-weight: bold;">Sincronizando con el Proxy de Divisas...</p>
        </div>
    {:else if errorMensaje}
        <div style="background: #fef2f2; border: 1px solid #ef4444; color: #b91c1c; padding: 1rem; border-radius: 8px;">
            <strong>Error:</strong> {errorMensaje}
        </div>
    {:else}
        <div style="background: white; border-radius: 16px; padding: 2rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
            <div bind:this={chartElement}></div>
            
            <div style="margin-top: 2rem; font-size: 0.9rem; color: #475569; line-height: 1.6;">
                <p><strong>Nota:</strong> Este indicador muestra cuántas unidades de moneda local se obtienen por 1 USD.</p>
                <ul style="margin-top: 0.5rem;">
                    <li>Valores en <strong>Verde</strong>: Monedas fuertes frente al dólar (mercado estable).</li>
                    <li>Valores en <strong>Rojo</strong>: Monedas locales débiles (los productos importados son más caros para el cliente).</li>
                </ul>
            </div>
        </div>
    {/if}
</main>