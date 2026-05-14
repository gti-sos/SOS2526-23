<script>
    import { onMount, tick } from 'svelte';
    
    let chartContainer = $state();
    let autenticado = $state(true);
    let cargando = $state(true);

    onMount(async () => {
        try {
            const c3 = await import('c3');
            const res = await fetch('/integrations/online-sales-popular-marketplaces/api-health');
            
            if (res.status === 401) {
                autenticado = false;
                cargando = false;
                return;
            }

            const { salesData, healthStats } = await res.json();

            // Unión de todas las fechas mensuales disponibles [cite: 4]
            const todasLasFechas = [...new Set([
                ...healthStats.map(h => h.date),
                ...salesData.map(s => s.date)
            ])].sort();

            // Preparación de columnas de datos [cite: 5, 7]
            const datosPasos = ['Pasos'].concat(
                todasLasFechas.map(f => {
                    const registro = healthStats.find(h => h.date === f);
                    return registro ? registro.steps : 0; 
                })
            );

            const datosIngresos = ['Ingresos ($)'].concat(
                todasLasFechas.map(f => {
                    const registro = salesData.find(s => s.date === f);
                    return registro ? registro.total : 0; 
                })
            );

            cargando = false; 
            await tick();

            // Generación de la gráfica con doble eje [cite: 10, 11]
            c3.generate({
                bindto: chartContainer,
                data: {
                    columns: [datosPasos, datosIngresos],
                    type: 'bar',
                    types: { 'Ingresos ($)': 'line' },
                    axes: {
                        'Pasos': 'y',
                        'Ingresos ($)': 'y2'
                    },
                },
                axis: {
                    x: { 
                        type: 'category', 
                        categories: todasLasFechas, 
                        label: 'Meses de 2024'
                    },
                    y: { label: 'Pasos Totales del Mes' }, 
                    y2: { 
                        show: true, 
                        label: 'Ventas Totales del Mes ($)' 
                    }
                }
            });
        } catch (e) {
            console.error(e); 
            cargando = false;
        }
    });
</script>

<main>
    <h1>Análisis: Ventas vs Actividad Física</h1>

    {#if !autenticado}
        <div class="auth-box">
            <p>Conecta tus datos de Google para ver la comparativa.</p>
            <button onclick={() => window.location.href = '/auth/health/login'} class="btn-google">
                Conectar con Google Health
            </button>
        </div> 
    {:else if cargando}
        <p>Sincronizando datos de API y Google...</p>
    {:else}
        <div bind:this={chartContainer} style="min-height: 400px;"></div>
        <p class="footer-info">Mostrando datos cruzados mediante un Join por mes.</p>
    {/if}
</main>

<style>
    main { max-width: 900px; margin: 0 auto; padding: 2rem; font-family: sans-serif; } 
    .btn-google { background: #4285F4; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; } 
    .auth-box { text-align: center; padding: 3rem; border: 2px dashed #ccc; border-radius: 12px; } 
    .footer-info { font-size: 0.9rem; color: #666; text-align: center; margin-top: 1rem; }
</style>