<script>
    import { onMount, tick } from 'svelte';
    
    // ==========================================
    // 1. DEFINICIÓN DE ESTADOS (SVELTE 5 REACTIVITY)
    // ==========================================
    // Svelte 5 usa $state() para declarar variables reactivas. 
    // Si el valor de estas variables cambia, el HTML se actualiza automáticamente.
    
    // Referencias al DOM y a la librería
    let chartContainer = $state(); // Apunta al <div> donde se dibuja la gráfica
    let chartInstance = $state();  // Guarda el objeto interno de Highcharts para poder actualizarlo sin recargar
    
    // Control de la Interfaz de Usuario (UI)
    let autenticado = $state(true);
    let cargando = $state(true);
    let errorCarga = $state("");

    // Datos maestros descargados de las APIs
    let todosLosAds = $state([]);
    let eventosValidos = $state([]); // Eventos filtrados que sí tienen coincidencia con Ads
    
    // Estado de la vista actual
    let eventoSeleccionado = $state(null); // Objeto del evento elegido en el desplegable
    let revenueActual = $state(0);         // Suma de dinero generada ese día

    // ==========================================
    // 2. FUNCIONES AUXILIARES
    // ==========================================

    /**
     * Filtra la lista global de Ads buscando los registros de una fecha concreta
     * y suma el 'revenue' de todos los continentes en ese día.
     */
    const calcularTotalDia = (fecha) => {
        return todosLosAds
            .filter(ad => ad.date === fecha)
            .reduce((sum, ad) => sum + Number(ad.revenue), 0);
    };

    /**
     * Se ejecuta cada vez que el usuario cambia el valor del <select>.
     * Calcula el nuevo total y anima la aguja del velocímetro sin redibujar toda la página.
     */
    const actualizarGrafica = () => {
        if (!eventoSeleccionado || !chartInstance) return;

        // Recalculamos ingresos para la nueva fecha
        const nuevoTotal = calcularTotalDia(eventoSeleccionado.date);
        revenueActual = nuevoTotal;

        // Actualizamos los textos (título/subtítulo) de la gráfica
        chartInstance.update({
            title: { text: `Impacto: ${eventoSeleccionado.title}` },
            subtitle: { text: `Análisis global del día: <b>${eventoSeleccionado.date}</b>`, useHTML: true }
        });
        
        // Movemos la aguja a la nueva posición
        chartInstance.series[0].points[0].update(Math.round(nuevoTotal));
    };

    // ==========================================
    // 3. CICLO DE VIDA: INICIALIZACIÓN (onMount)
    // ==========================================
    onMount(async () => {
        try {
            // IMPORTACIÓN DINÁMICA DE HIGHCHARTS
            // Lo importamos aquí (y no arriba) para evitar el error "SeriesRegistry is undefined".
            // Así garantizamos que la librería de gráficos solo se cargue en el navegador (Cliente) 
            // y no durante la compilación en el servidor de Render (SSR).
            const Highcharts = (await import('highcharts')).default;
            const HighchartsMore = (await import('highcharts/highcharts-more')).default;
            const Accessibility = (await import('highcharts/modules/accessibility')).default;

            if (typeof HighchartsMore === 'function') HighchartsMore(Highcharts);
            if (typeof Accessibility === 'function') Accessibility(Highcharts);

            // ==========================================
            // NUEVA LLAMADA: PROXY .PIPE() + FETCH DIRECTO
            // ==========================================

            // 1. Extraer el token de las cookies (Svelte lo lee del navegador)
            const getCookie = (name) => {
                const value = `; ${document.cookie}`;
                const parts = value.split(`; ${name}=`);
                if (parts.length === 2) return parts.pop().split(';').shift();
                return null;
            };
            const token = getCookie('google_calendar_token');

            if (!token) {
                autenticado = false;
                cargando = false;
                return;
            }

            // 2. Pedimos los Ads directamente a tu API en Render
            const resAds = await fetch('https://sos2526-23.onrender.com/api/v2/global-ads-performance');
            if (!resAds.ok) throw new Error("Fallo al cargar Ads");
            const adsData = await resAds.json();

            // 3. Pedimos los eventos a Google pasando por tu nuevo Proxy "Tubo"
            const localProxy = "http://localhost:3000"; // Ruta local para desarrollo
            const googleUrl = localProxy + '/api/proxy-calendar/calendar/v3/calendars/primary/events?timeMin=2024-01-01T00:00:00Z&singleEvents=true&orderBy=startTime&maxResults=1000';
            
            const resCal = await fetch(googleUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`, // ¡Vital para que Google te deje pasar!
                    'Accept': 'application/json'
                }
            });

            if (resCal.status === 401) {
                autenticado = false;
                cargando = false;
                return;
            }
            if (!resCal.ok) throw new Error("Error en Google Calendar");

            const rawCalendarData = await resCal.json();

            // 4. Transformamos el formato de Google a nuestro formato simple
            const events = (rawCalendarData.items || []).map(event => ({
                date: event.start?.date || (event.start?.dateTime ? event.start.dateTime.split('T')[0] : null),
                title: event.summary || "Evento sin título"
            })).filter(e => e.date !== null);

            // ==========================================

            // NORMALIZACIÓN DE FECHAS
            // Aseguramos que tanto Google como nuestra API hablen el mismo "idioma" de fechas (YYYY-MM-DD)
            // para que el cruce de datos sea exacto.
            const limpiarFecha = (fecha) => {
                try { return new Date(fecha).toISOString().split('T')[0]; } 
                catch (e) { return fecha; }
            };

            // Aplicamos la limpieza
            todosLosAds = adsData.map(ad => ({ ...ad, date: limpiarFecha(ad.date) }));
            const eventosLimpios = events.map(ev => ({ ...ev, date: limpiarFecha(ev.date) }));

            // CRUZAR DATOS (INNER JOIN)
            // Nos quedamos exclusivamente con los eventos del calendario que ocurrieron en un día
            // donde también tenemos registros de publicidad.
            eventosValidos = eventosLimpios.filter(ev => 
                todosLosAds.some(ad => ad.date === ev.date)
            );

            // ESTADO POR DEFECTO
            // Cargamos el primer evento disponible en el selector al entrar a la página
            if (eventosValidos.length > 0) {
                eventoSeleccionado = eventosValidos[0];
            } else {
                // Failsafe: Si no hay eventos cruzados, mostramos el último día con métricas
                const ultimaFecha = adsData[adsData.length - 1].date;
                eventoSeleccionado = { title: "Últimos datos disponibles", date: ultimaFecha };
            }

            // Calculamos el revenue de este primer evento para poner la aguja en su sitio
            revenueActual = calcularTotalDia(eventoSeleccionado.date);

            // ==========================================
            // 4. RENDERIZADO DE LA GRÁFICA
            // ==========================================
            
            cargando = false; // Quitamos el estado de carga
            
            // EL TRUCO DEL TICK()
            // Svelte necesita un instante para quitar el "Cargando..." y dibujar el <div bind:this={chartContainer}> en el HTML.
            // tick() hace una micropausa obligatoria para garantizar que el div ya existe antes de que Highcharts intente usarlo.
            await tick();

            // Inyectamos la gráfica en el contenedor
            chartInstance = Highcharts.chart(chartContainer, {
                chart: { type: 'gauge', backgroundColor: 'transparent', spacingBottom: 40 },
                title: { text: `Impacto: ${eventoSeleccionado.title}`, style: { fontWeight: 'bold' } },
                subtitle: { text: `Análisis global del día: <b>${eventoSeleccionado.date}</b>`, useHTML: true },
                pane: { startAngle: -90, endAngle: 89.9, center: ['50%', '75%'], size: '130%', background: null },
                yAxis: {
                    min: 0, max: 200000,
                    plotBands: [ // Definimos las zonas de semáforo de ingresos
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
                credits: { enabled: false } // Oculta el logo de Highcharts
            });

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
            <button onclick={() => window.location.href = '/auth/calendar/login'} class="btn-google">
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
    /* Estilo encapsulado para el botón de acceso de Google */
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