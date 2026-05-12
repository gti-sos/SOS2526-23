<script>
    import { onMount, tick } from 'svelte';

    let cargando = $state(true);
    let errorCarga = $state(false);
    let resumenPaises = $state([]);

    onMount(async () => {
        try {
            const [resBolsa, resOcio] = await Promise.all([
                fetch('/api/v1/daily-global-stock-market-indicators'),
                fetch('/api/v1/proxy/recreation-culture')
            ]);

            if (!resBolsa.ok || !resOcio.ok) throw new Error('Error en las APIs');

            const datosBolsa = await resBolsa.json();
            const datosOcio  = await resOcio.json();

            // ── 1. Calcular variación media por REGIÓN (tu API) ──────────────
            const cambiosPorRegion = {};
            datosBolsa.forEach(idx => {
                if (!cambiosPorRegion[idx.region]) cambiosPorRegion[idx.region] = [];
                cambiosPorRegion[idx.region].push(idx.daily_change_percent);
            });
            const mediaPorRegion = {};
            for (const [region, valores] of Object.entries(cambiosPorRegion)) {
                mediaPorRegion[region] = valores.reduce((s, v) => s + v, 0) / valores.length;
            }

            // ── 2. Mapping país → región ─────────────────────────────────────
            const paisRegion = {
                'United States': 'North America',
                'Canada':        'North America',
                'Mexico':        'North America',
                'United Kingdom':'Europe',
                'Germany':       'Europe',
                'Spain':         'Europe',
                'Italy':         'Europe',
                'Finland':       'Europe',
                'Ireland':       'Europe',
                'Poland':        'Europe',
            };

            // ── 3. Calcular gasto medio en ocio por país (API G24) ───────────
            const paises = [...new Set(datosOcio.map(d => d.country))];
            const puntos = paises
                .filter(p => paisRegion[p])
                .map(pais => {
                    const regs = datosOcio.filter(d => d.country === pais);
                    const mediaOcio = regs.reduce((s, d) => s + d.recreation_share, 0) / regs.length;
                    const mediaPerCapita = regs.reduce((s, d) => s + d.recreation_per_capita, 0) / regs.length;
                    const region = paisRegion[pais];
                    const cambioMercado = mediaPorRegion[region] ?? 0;
                    return {
                        pais,
                        region,
                        mediaOcio:      parseFloat(mediaOcio.toFixed(2)),
                        cambioMercado:  parseFloat(cambioMercado.toFixed(3)),
                        mediaPerCapita: parseFloat(mediaPerCapita.toFixed(0))
                    };
                });

            // ── 4. Tabla resumen ─────────────────────────────────────────────
            resumenPaises = [...puntos].sort((a, b) => b.mediaOcio - a.mediaOcio);

            cargando = false;
            await tick();

            setTimeout(() => {
                if (!window.ApexCharts) return;

                // Separar por región para colores distintos
                const norteamerica = puntos.filter(p => p.region === 'North America');
                const europa       = puntos.filter(p => p.region === 'Europe');

                new window.ApexCharts(
                    document.querySelector('#scatter-cruce'),
                    {
                        chart: {
                            type: 'scatter',
                            height: 480,
                            zoom: { enabled: true, type: 'xy' },
                            toolbar: { show: true }
                        },
                        series: [
                            {
                                name: '🌎 Norteamérica',
                                data: norteamerica.map(p => ({
                                    x: p.mediaOcio,
                                    y: p.cambioMercado,
                                    pais: p.pais,
                                    perCapita: p.mediaPerCapita
                                }))
                            },
                            {
                                name: '🇪🇺 Europa',
                                data: europa.map(p => ({
                                    x: p.mediaOcio,
                                    y: p.cambioMercado,
                                    pais: p.pais,
                                    perCapita: p.mediaPerCapita
                                }))
                            }
                        ],
                        title: {
                            text: '¿Más ocio = mejores mercados?',
                            align: 'center',
                            style: { fontSize: '16px', fontWeight: 'bold' }
                        },
                        subtitle: {
                            text: 'Cruce: Gasto en ocio (API G24) vs Rendimiento bursátil por región (API propia)',
                            align: 'center'
                        },
                        xaxis: {
                            title: { text: '🎭 Gasto medio en ocio (% consumo hogar) — API G24' },
                            tickAmount: 8,
                            labels: { formatter: v => v + '%' }
                        },
                        yaxis: {
                            title: { text: '📈 Variación media índices bursátiles (%) — API propia' },
                            labels: { formatter: v => v + '%' }
                        },
                        markers: { size: 10 },
                        tooltip: {
                            custom: ({ seriesIndex, dataPointIndex, w }) => {
                                const p = w.config.series[seriesIndex].data[dataPointIndex];
                                return `
                                    <div style="padding:10px; font-size:13px;">
                                        <strong>${p.pais}</strong><br/>
                                        🎭 Gasto ocio: <b>${p.x}%</b><br/>
                                        📈 Variación mercado: <b>${p.y}%</b><br/>
                                        💶 Ocio per cápita: <b>${p.perCapita.toLocaleString()}€</b>
                                    </div>`;
                            }
                        },
                        annotations: {
                            yaxis: [{
                                y: 0,
                                borderColor: '#999',
                                strokeDashArray: 4,
                                label: { text: 'Mercado neutral (0%)', style: { color: '#999' } }
                            }]
                        },
                        colors: ['#008FFB', '#FF4560']
                    }
                ).render();

                // Heatmap secundario: recreation_share por país y año
                const paisesOrdenados = [...new Set(datosOcio.map(d => d.country))].sort();
                const years = ['2021', '2022', '2023', '2024'];
                const seriesHeatmap = paisesOrdenados.map(pais => ({
                    name: pais,
                    data: years.map(year => {
                        const reg = datosOcio.find(d => d.country === pais && String(d.year) === year);
                        return { x: year, y: reg ? parseFloat(reg.recreation_share.toFixed(2)) : 0 };
                    })
                }));

                new window.ApexCharts(
                    document.querySelector('#heatmap-ocio'),
                    {
                        chart: { type: 'heatmap', height: 380, toolbar: { show: false } },
                        title: {
                            text: 'Evolución del gasto en ocio por país y año',
                            align: 'center',
                            style: { fontSize: '14px' }
                        },
                        subtitle: {
                            text: 'Fuente: API Grupo 24 (SOS2526-24)',
                            align: 'center'
                        },
                        series: seriesHeatmap,
                        dataLabels: {
                            enabled: true,
                            formatter: val => val > 0 ? val + '%' : 'N/D'
                        },
                        plotOptions: {
                            heatmap: {
                                shadeIntensity: 0.6,
                                radius: 4,
                                colorScale: {
                                    ranges: [
                                        { from: 0,  to: 0.1, color: '#e8e8e8', name: 'Sin datos' },
                                        { from: 4,  to: 6,   color: '#c6efce', name: 'Bajo (4–6%)' },
                                        { from: 6,  to: 8,   color: '#ffeb9c', name: 'Medio (6–8%)' },
                                        { from: 8,  to: 12,  color: '#ffc7ce', name: 'Alto (>8%)' }
                                    ]
                                }
                            }
                        },
                        tooltip: {
                            y: { formatter: val => val > 0 ? val + '%' : 'Sin datos' }
                        }
                    }
                ).render();

            }, 300);

        } catch (error) {
            console.error('❌ Error:', error);
            errorCarga = true;
            cargando = false;
        }
    });
</script>

<svelte:head>
    <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
</svelte:head>

<main style="padding: 20px; font-family: sans-serif; max-width: 980px; margin: 0 auto;">

    <h2>🎭 Ocio & Cultura vs Rendimiento Bursátil</h2>
    <p>
        Cruce de la <strong>API del Grupo 24 (SOS2526-24)</strong> — gasto en ocio y cultura —
        con nuestra <strong>API propia de indicadores bursátiles</strong>,
        visualizado con <strong>ApexCharts</strong> a través de un proxy propio.
        ¿Los países que más gastan en ocio pertenecen a regiones con mejores mercados financieros?
    </p>

    {#if errorCarga}
        <div style="background:#fee; color:#c00; padding:15px; border-radius:5px; text-align:center;">
            ⚠️ <strong>Error:</strong> No se pudieron cargar los datos. Abre la consola (F12).
        </div>
    {/if}

    {#if cargando && !errorCarga}
        <div style="text-align:center; padding:40px; color:#666;">
            ⏳ Cargando y cruzando datos de ambas APIs...
        </div>
    {/if}

    {#if !cargando && !errorCarga}

        <!-- GRÁFICA PRINCIPAL: Scatter de cruce real -->
        <div style="background:#fff; border:1px solid #e0e0e0; border-radius:8px; padding:16px; margin-bottom:28px;">
            <div id="scatter-cruce"></div>
            <p style="font-size:0.82em; color:#888; text-align:center; margin-top:8px;">
                Cada punto es un país. Eje X = gasto en ocio (API G24). Eje Y = variación media bursátil de su región (API propia).
            </p>
        </div>

        <!-- GRÁFICA SECUNDARIA: Heatmap evolución temporal -->
        <div style="background:#fff; border:1px solid #e0e0e0; border-radius:8px; padding:16px; margin-bottom:28px;">
            <div id="heatmap-ocio"></div>
        </div>

        <!-- Tabla resumen -->
        <h3>📊 Resumen por país</h3>
        <table style="width:100%; border-collapse:collapse; font-size:0.92em;">
            <thead>
                <tr style="background:#1976d2; color:white;">
                    <th style="padding:10px 14px; text-align:left;">País</th>
                    <th style="padding:10px 14px; text-align:left;">Región</th>
                    <th style="padding:10px 14px; text-align:right;">Gasto ocio medio</th>
                    <th style="padding:10px 14px; text-align:right;">Variación mercado regional</th>
                </tr>
            </thead>
            <tbody>
                {#each resumenPaises as item, i}
                    <tr style="background:{i % 2 === 0 ? '#f8f9fa' : 'white'};">
                        <td style="padding:10px 14px;">{item.pais}</td>
                        <td style="padding:10px 14px; color:#666;">{item.region}</td>
                        <td style="padding:10px 14px; text-align:right; font-weight:bold;">{item.mediaOcio}%</td>
                        <td style="padding:10px 14px; text-align:right;
                            color:{item.cambioMercado >= 0 ? '#2e7d32' : '#c62828'}; font-weight:bold;">
                            {item.cambioMercado > 0 ? '+' : ''}{item.cambioMercado}%
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>

    {/if}

    <br>
    <a href="/integrations"
       style="display:inline-block; margin-top:20px; text-decoration:none; color:#007bff;
              font-weight:bold; padding:10px 20px; border:1px solid #007bff; border-radius:5px;">
        ⬅ Volver a Integraciones
    </a>

</main>