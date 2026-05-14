<script>
    import { onMount, tick } from 'svelte';
    import c3 from 'c3';
    import 'c3/c3.css';

    let cargando = $state(true);
    let errorMensaje = $state("");
    let chartElement = $state();

    // Mapeo para unificar criterios entre APIs
    const mapaRegiones = {
        "North America": "Americas",
        "South America": "Americas",
        "Europe": "Europe",
        "Asia": "Asia",
        "Africa": "Africa",
        "Oceania": "Oceania"
    };

    onMount(async () => {
        try {
            const miUrl = 'https://sos2526-23.onrender.com/api/v1/online-sales-popular-marketplaces';
            const extUrl = 'https://restcountries.com/v3.1/all?fields=region,population';
            
            const [miRespuesta, extRespuesta] = await Promise.all([
                fetch(miUrl),
                fetch(extUrl)
            ]);

            if (!miRespuesta.ok || !extRespuesta.ok) throw new Error("Fallo al obtener datos");

            const misDatos = await miRespuesta.json();
            const datosPaises = await extRespuesta.json();

            // Agregamos datos por región normalizada
            let stats = {
                "Americas": { ventas: 0, poblacion: 0 },
                "Europe": { ventas: 0, poblacion: 0 },
                "Asia": { ventas: 0, poblacion: 0 },
                "Africa": { ventas: 0, poblacion: 0 },
                "Oceania": { ventas: 0, poblacion: 0 }
            };

            // Sumar tus ventas
            misDatos.forEach(d => {
                let r = mapaRegiones[d.region];
                if (stats[r]) stats[r].ventas += (Number(d.total) || 0);
            });

            // Sumar población de API externa
            datosPaises.forEach(p => {
                if (stats[p.region]) stats[p.region].poblacion += p.population;
            });

            // Solo regiones con datos
            const regionesEtiquetas = Object.keys(stats).filter(r => stats[r].ventas > 0);
            
            // Normalizamos los valores a una escala 0-100 para que sean comparables visualmente
            // (Ya que la población son miles de millones y las ventas pueden ser millones)
            const maxVentas = Math.max(...regionesEtiquetas.map(r => stats[r].ventas));
            const maxPob = Math.max(...regionesEtiquetas.map(r => stats[r].poblacion));

            const datosVentasNorm = ['Ventas (Relativo)'].concat(regionesEtiquetas.map(r => (stats[r].ventas / maxVentas) * 100));
            const datosPobNorm = ['Población (Relativo)'].concat(regionesEtiquetas.map(r => (stats[r].poblacion / maxPob) * 100));

            cargando = false;
            await tick();

            c3.generate({
                bindto: chartElement,
                data: {
                    columns: [datosVentasNorm, datosPobNorm],
                    type: 'step' // Usamos STEP para marcar la diferencia entre regiones
                },
                axis: {
                    x: {
                        type: 'category',
                        categories: regionesEtiquetas,
                        label: 'Continentes'
                    },
                    y: {
                        label: 'Porcentaje sobre el máximo (%)',
                        max: 100,
                        min: 0,
                        padding: { top: 20, bottom: 0 }
                    }
                },
                grid: { y: { show: true } },
                color: { pattern: ['#3b82f6', '#ef4444'] },
                tooltip: {
                    format: {
                        value: (val, ratio, id, index) => {
                            const reg = regionesEtiquetas[index];
                            if (id === 'Ventas (Relativo)') {
                                return new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'}).format(stats[reg].ventas);
                            }
                            return (stats[reg].poblacion / 1_000_000).toFixed(1) + " M de habitantes";
                        }
                    }
                }
            });

        } catch (e) {
            errorMensaje = e.message;
            cargando = false;
        }
    });
</script>

<main style="padding: 2rem; font-family: sans-serif; background: #fdfdfd; min-height: 100vh;">
    <section style="max-width: 900px; margin: 0 auto; background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        <h2 style="color: #1e293b; border-left: 4px solid #3b82f6; padding-left: 1rem;">
            Comparativa: Densidad Poblacional vs Desempeño Comercial
        </h2>
        
        <p style="color: #64748b; line-height: 1.5; margin: 1.5rem 0;">
            En esta gráfica de tipo <strong>Step (Escalones)</strong>, comparamos el peso relativo de la población frente a las ventas. 
            Si la línea <span style="color: #3b82f6; font-weight: bold;">Azul (Ventas)</span> está por encima de la 
            <span style="color: #ef4444; font-weight: bold;">Roja (Población)</span>, significa que la región es altamente eficiente en ventas por habitante.
        </p>

        {#if cargando}
            <div style="height: 300px; display: grid; place-items: center; color: #3b82f6;">
                <strong>Cargando indicadores de rendimiento...</strong>
            </div>
        {:else if errorMensaje}
            <div style="color: red; padding: 1rem; border: 1px solid red;">{errorMensaje}</div>
        {:else}
            <div bind:this={chartElement}></div>
        {/if}
    </section>
</main>