<script>
    import { onMount } from 'svelte';

    let chartContainer;
    let errorMessage = $state("");

    onMount(async () => {
        // ✅ Imports dinámicos dentro del onMount para evitar el problema de SSR
        const Highcharts = (await import('highcharts')).default;
        const { default: AccessibilityModule } = await import('highcharts/modules/accessibility');
    if (typeof AccessibilityModule === 'function') {
        AccessibilityModule(Highcharts);
    }

        try {
            const [stockRes, adsRes, salesRes] = await Promise.all([
                fetch('/api/v1/daily-global-stock-market-indicators'),
                fetch('/api/v1/global-ads-performance'),
                fetch('/api/v1/online-sales-popular-marketplaces')
            ]);

            if (!stockRes.ok || !adsRes.ok || !salesRes.ok) {
                throw new Error("Una de las APIs no respondió correctamente");
            }

            const stockData = await stockRes.json();
            const adsData   = await adsRes.json();
            const salesData = await salesRes.json();

            const regions = [...new Set([
                ...stockData.map(d => d.region),
                ...adsData.map(d => d.region),
                ...salesData.map(d => d.region)
            ])].filter(Boolean);

            const stockSeries = [];
            const adsSeries   = [];
            const salesSeries = [];

            regions.forEach(region => {
                const regionNorm = region.toLowerCase().trim();

                const regionStocks = stockData.filter(d => d.region?.toLowerCase().trim() === regionNorm);
                const avgClose = regionStocks.length
                    ? regionStocks.reduce((sum, d) => sum + Number(d.close || 0), 0) / regionStocks.length
                    : 0;
                stockSeries.push(Number(avgClose.toFixed(2)));

                const regionAds = adsData.filter(d => d.region?.toLowerCase().trim() === regionNorm);
                const totalAdsRevenue = regionAds.reduce((sum, d) => sum + Number(d.revenue || 0), 0);
                adsSeries.push(Number(totalAdsRevenue.toFixed(2)));

                const regionSales = salesData.filter(d => d.region?.toLowerCase().trim() === regionNorm);
                const totalSales = regionSales.reduce((sum, d) => sum + Number(d.total || 0), 0);
                salesSeries.push(Number(totalSales.toFixed(2)));
            });

            Highcharts.chart(chartContainer, {
                chart: {
                    zoomType: 'xy',
                    style: { fontFamily: 'Arial, sans-serif' },
                    marginLeft: 170,
                    marginRight: 80,
                    events: {
                        render: function () {
                            const chart = this;
                            const axis0 = chart.yAxis[0];

                            const x = axis0.left - 5;
                            const y1 = chart.plotTop;
                            const y2 = chart.plotTop + chart.plotHeight;

                            if (chart.separatorLine) chart.separatorLine.destroy();
                            chart.separatorLine = chart.renderer
                                .path(['M', x, y1, 'L', x, y2])
                                .attr({ stroke: '#ddd', 'stroke-width': 1.5, 'stroke-dasharray': '4,3' })
                                .add();
                        }
                    }
                },
                title: {
                    text: 'Análisis Integrado: Bolsa, Publicidad y Ventas Online',
                    style: { fontSize: '16px', fontWeight: '700', color: '#222' }
                },
                subtitle: {
                    text: 'Publicidad (barras) · Bolsa y Ventas Online (líneas con ejes propios)',
                    style: { color: '#777', fontSize: '12px' }
                },
                accessibility: { enabled: true },

                xAxis: {
                    categories: regions,
                    crosshair: true,
                    labels: { style: { fontSize: '13px', color: '#444' } }
                },

                yAxis: [
                    {
                        title: {
                            text: 'Publicidad ($)',
                            style: { color: '#4e9af1', fontWeight: '600' }
                        },
                        labels: {
                            formatter: function () {
                                if (this.value >= 1000000) return '$' + (this.value / 1000000).toFixed(1) + 'M';
                                if (this.value >= 1000)    return '$' + (this.value / 1000).toFixed(0) + 'K';
                                return '$' + this.value;
                            },
                            style: { color: '#4e9af1' }
                        },
                        gridLineColor: '#ebebeb',
                        offset: 0,
                        min: 0
                    },
                    {
                        title: {
                            text: 'Bolsa (pts)',
                            style: { color: '#8bbc21', fontWeight: '600' }
                        },
                        labels: {
                            formatter: function () {
                                if (this.value >= 1000) return (this.value / 1000).toFixed(0) + 'K pts';
                                return this.value + ' pts';
                            },
                            style: { color: '#8bbc21' }
                        },
                        opposite: true,
                        gridLineWidth: 0,
                        offset: 0,
                        min: 0
                    },
                    {
                        title: {
                            text: 'Ventas Online ($)',
                            style: { color: '#e85d04', fontWeight: '600' },
                            margin: 15
                        },
                        labels: {
                            formatter: function () {
                                if (this.value >= 1000) return '$' + (this.value / 1000).toFixed(1) + 'K';
                                return '$' + this.value;
                            },
                            style: { color: '#e85d04' }
                        },
                        opposite: false,
                        gridLineWidth: 0,
                        offset: 90,
                        min: 0
                    }
                ],

                tooltip: {
                    shared: true,
                    backgroundColor: 'rgba(255,255,255,0.97)',
                    borderColor: '#ddd',
                    borderRadius: 8,
                    shadow: true,
                    style: { fontSize: '13px' },
                    formatter: function () {
                        let s = `<b>${this.points[0].key}</b><br/>`;
                        this.points.forEach(p => {
                            const color = p.series.color;
                            let val = '';
                            if (p.series.name === 'Cierre Medio Bolsa') {
                                val = Highcharts.numberFormat(p.y, 2) + ' pts';
                            } else {
                                val = '$' + Highcharts.numberFormat(p.y, 2);
                            }
                            s += `<span style="color:${color}">●</span> ${p.series.name}: <b>${val}</b><br/>`;
                        });
                        return s;
                    }
                },

                legend: {
                    layout: 'horizontal',
                    align: 'center',
                    verticalAlign: 'bottom',
                    itemStyle: { fontSize: '12px', fontWeight: '500', color: '#333' }
                },

                plotOptions: {
                    column: {
                        borderRadius: 5,
                        borderWidth: 0,
                        pointPadding: 0.15,
                        groupPadding: 0.2,
                        dataLabels: {
                            enabled: true,
                            formatter: function () {
                                if (this.y >= 1000000) return '$' + (this.y / 1000000).toFixed(1) + 'M';
                                if (this.y >= 1000)    return '$' + (this.y / 1000).toFixed(0) + 'K';
                                return '$' + this.y;
                            },
                            style: {
                                fontSize: '11px',
                                fontWeight: '600',
                                color: '#4e9af1',
                                textOutline: 'none'
                            }
                        }
                    },
                    spline: {
                        lineWidth: 2.5,
                        marker: {
                            radius: 5,
                            lineWidth: 2,
                            fillColor: 'white'
                        },
                        dataLabels: {
                            enabled: true,
                            formatter: function () {
                                if (this.series.name === 'Cierre Medio Bolsa') {
                                    if (this.y >= 1000) return (this.y / 1000).toFixed(1) + 'K';
                                    return this.y;
                                }
                                if (this.y >= 1000) return '$' + (this.y / 1000).toFixed(1) + 'K';
                                return '$' + this.y;
                            },
                            style: {
                                fontSize: '11px',
                                fontWeight: '600',
                                textOutline: 'none'
                            }
                        }
                    }
                },

                series: [
                    {
                        name: 'Ingresos por Publicidad',
                        type: 'column',
                        yAxis: 0,
                        data: adsSeries,
                        color: '#4e9af1',
                        tooltip: { valuePrefix: '$' }
                    },
                    {
                        name: 'Cierre Medio Bolsa',
                        type: 'spline',
                        yAxis: 1,
                        data: stockSeries,
                        color: '#8bbc21',
                        tooltip: { valueSuffix: ' pts' },
                        marker: { lineColor: '#8bbc21' },
                        dataLabels: { color: '#8bbc21' }
                    },
                    {
                        name: 'Ventas Online Totales',
                        type: 'spline',
                        yAxis: 2,
                        data: salesSeries,
                        color: '#e85d04',
                        tooltip: { valuePrefix: '$' },
                        marker: { lineColor: '#e85d04' },
                        dataLabels: { color: '#e85d04' }
                    }
                ]
            });

        } catch (error) {
            console.error("Error procesando los datos:", error);
            errorMessage = "Hubo un problema al cargar los datos combinados.";
        }
    });
</script>

<main>
    <div class="header">
        <h1>Dashboard Global Combinado</h1>
        <a href="/" class="btn-back">← Volver al inicio</a>
    </div>

    {#if errorMessage}
        <div class="error-box">
            <p>{errorMessage}</p>
        </div>
    {/if}

    <div class="chart-wrapper">
        <div bind:this={chartContainer} style="width: 100%; height: 560px;"></div>
    </div>
</main>

<style>
    main {
        max-width: 1100px;
        margin: 0 auto;
        padding: 20px;
        font-family: Arial, sans-serif;
    }
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }
    h1 { color: #333; margin: 0; }
    .btn-back {
        background-color: #6c757d;
        color: white;
        padding: 8px 16px;
        text-decoration: none;
        border-radius: 4px;
        font-weight: bold;
    }
    .btn-back:hover { background-color: #5a6268; }
    .error-box {
        background-color: #ffebee;
        color: #c62828;
        padding: 15px;
        border-radius: 5px;
        margin-bottom: 20px;
        border: 1px solid #ef9a9a;
    }
    .chart-wrapper {
        background: white;
        padding: 20px 15px 15px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
</style>