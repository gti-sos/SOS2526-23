<script>
    import { onMount, tick } from 'svelte';
    // Estados de Svelte 5
    let chartContainer = $state();
    let chartInstance = $state();
    let autenticado = $state(true);
    let cargando = $state(true);
    let errorCarga = $state("");

    // Datos maestros
    let todosLosAds = $state([]);
    let eventosValidos = $state([]);
    
    // Selección actual
    let eventoSeleccionado = $state(null);
    let revenueActual = $state(0);

    // Función para calcular el total de todos los continentes de una fecha
    const calcularTotalDia = (fecha) => {
        return todosLosAds
            .filter(ad => ad.date === fecha)
            .reduce((sum, ad) => sum + Number(ad.revenue), 0);
    };

    // Función para actualizar la gráfica cuando cambia el selector
    const actualizarGrafica = () => {
        if (!eventoSeleccionado || !chartInstance) return;

        const nuevoTotal = calcularTotalDia(eventoSeleccionado.date);
        revenueActual = nuevoTotal;

        // Actualizamos título y datos de la aguja
        chartInstance.update({
            title: { text: `Impacto: ${eventoSeleccionado.title}` },
            subtitle: { text: `Análisis global del día: <b>${eventoSeleccionado.date}</b>`, useHTML: true }
        });
        chartInstance.series[0].points[0].update(Math.round(nuevoTotal));
    };

    onMount(async () => {
        try {
            // IMPORTACIÓN DINÁMICA
            const Highcharts = (await import('highcharts')).default;
            const HighchartsMore = (await import('highcharts/highcharts-more')).default;
            const Accessibility = (await import('highcharts/modules/accessibility')).default;

            if (typeof HighchartsMore === 'function') HighchartsMore(Highcharts);
            if (typeof Accessibility === 'function') Accessibility(Highcharts);

            // Carga de datos desde tu Proxy
            const res = await fetch('/integrations/global-ads-performance/api-calendar'); 
            
            if (res.status === 401) {
                autenticado = false;
                cargando = false;
                return;
            }

            if (!res.ok) throw new Error("Error al obtener datos del servidor");

const { adsData, events } = await res.json();

            // Función para asegurar que todas las fechas sean formato YYYY-MM-DD
            const limpiarFecha = (fecha) => {
                try { return new Date(fecha).toISOString().split('T')[0]; } 
                catch (e) { return fecha; }
            };

            // Limpiamos ambos arrays antes de cruzarlos
            todosLosAds = adsData.map(ad => ({ ...ad, date: limpiarFecha(ad.date) }));
            const eventosLimpios = events.map(ev => ({ ...ev, date: limpiarFecha(ev.date) }));

            // Ahora filtramos usando los datos limpios
            eventosValidos = eventosLimpios.filter(ev => 
                todosLosAds.some(ad => ad.date === ev.date)
            );

            // Seleccionar por defecto
            if (eventosValidos.length > 0) {
                eventoSeleccionado = eventosValidos[0];
            } else {
                const ultimaFecha = adsData[adsData.length - 1].date;
                eventoSeleccionado = { title: "Últimos datos disponibles", date: ultimaFecha };
            }

            revenueActual = calcularTotalDia(eventoSeleccionado.date);

            // 1. Quitamos la pantalla de carga
            cargando = false;
            
            // 2. Esperamos a que Svelte dibuje el <div> en la pantalla
            await tick();

            // Crear la gráfica inicial
            chartInstance = Highcharts.chart(chartContainer, {
                chart: { type: 'gauge', backgroundColor: 'transparent', spacingBottom: 40 },
                title: { text: `Impacto: ${eventoSeleccionado.title}`, style: { fontWeight: 'bold' } },
                subtitle: { text: `Análisis global del día: <b>${eventoSeleccionado.date}</b>`, useHTML: true },
                pane: { startAngle: -90, endAngle: 89.9, center: ['50%', '75%'], size: '130%', background: null },
                yAxis: {
                    min: 0, max: 200000,
                    plotBands: [
                        { from: 0, to: 75000, color: '#DF5353', thickness: 25, label: { text: 'Bajo' } },
                        { from: 75000, to: 125000, color: '#DDDF0D', thickness: 25, label: { text: 'Medio' } },
                        { from: 125000, to: 200000, color: '#55BF3B', thickness: 25, label: { text: 'Óptimo' } }
                    ]
                },
                series: [{
                    name: 'Revenue Global',
                    data: [Math.round(revenueActual)],
                    dataLabels: { format: '{y} USD', style: { fontSize: '22px', border: 'none' }, y: 35 },
                    dial: { radius: '80%', backgroundColor: 'gray', baseWidth: 12 },
                    pivot: { radius: 6, backgroundColor: 'gray' }
                }],
                credits: { enabled: false }
            });

            cargando = false;
        } catch (error) {
            errorCarga = error.message;
            cargando = false;
        }
    });
</script>

<main style="padding: 2rem; max-width: 1000px; margin: 0 auto; font-family: sans-serif;">
    {#if !autenticado}
        <div style="text-align: center; padding: 4rem; border: 2px dashed #4285F4; border-radius: 15px;">
            <h2>🔓 Área de Clientes</h2>
            <button onclick={() => window.location.href = '/auth/login'} class="btn-google">
                Conectar con Google Calendar
            </button>
        </div>
    {:else if errorCarga}
        <p style="color: red; text-align: center;"><strong>Error:</strong> {errorCarga}</p>
    {:else if cargando}
        <div style="text-align: center; padding: 4rem;">
            <p style="font-size: 18px; color: #4285F4; font-weight: bold;">🔄 Sincronizando con Google Calendar...</p>
        </div>
    {:else}
        <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; border: 1px solid #dee2e6; text-align: center;">
            <label for="event-select" style="display: block; margin-bottom: 0.5rem; font-weight: bold; color: #495057;">
                Selecciona un evento para analizar el impacto:
            </label>
            
            <select 
                id="event-select"
                bind:value={eventoSeleccionado} 
                onchange={actualizarGrafica}
                style="padding: 10px; border-radius: 6px; border: 1px solid #ced4da; width: 100%; max-width: 500px; font-size: 16px; cursor: pointer;"
            >
                {#if eventosValidos.length === 0}
                    <option value={eventoSeleccionado}>
                        No hay eventos coincidentes (Viendo {eventoSeleccionado?.date})
                    </option>
                {:else}
                    {#each eventosValidos as ev}
                        <option value={ev}>
                            {ev.title} — ({ev.date})
                        </option>
                    {/each}
                {/if}
            </select>
        </div>

        <div bind:this={chartContainer} style="width: 100%; height: 500px;"></div>

        <section style="margin-top: 1rem; padding: 1.5rem; background: #e9ecef; border-radius: 10px;">
            <h4 style="margin-top: 0;">📊 Resumen de Impacto Global</h4>
            <p>
                Analizando el evento <strong>"{eventoSeleccionado?.title}"</strong> del día <strong>{eventoSeleccionado?.date}</strong>. 
                El ingreso total generado entre todos los continentes fue de <strong>{Math.round(revenueActual).toLocaleString()} USD</strong>.
            </p>
        </section>
    {/if}
</main>

<style>
    .btn-google {
        background: #4285F4;
        color: white;
        padding: 14px 28px;
        border: none;
        border-radius: 8px;
        font-weight: bold;
        cursor: pointer;
        transition: 0.3s;
    }
    .btn-google:hover { background: #357ae8; }
</style>