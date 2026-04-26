<script>
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';

    let chartContainer;
    let errorMessage = '';

    onMount(async () => {
        if (!browser) return;
        try {
            const HighchartsModule = await import('highcharts');
            const Highcharts = HighchartsModule.default || HighchartsModule;

            const response = await fetch('/api/v1/daily-global-stock-market-indicators');
            if (!response.ok) throw new Error('Error cargando la API');
            const apiData = await response.json();

            if (!apiData || apiData.length === 0) {
                errorMessage = 'Base de datos vacía.';
                return;
            }

            // Fechas únicas ordenadas
            const fechas = [...new Set(apiData.map(d => d.date))].sort();

            // Índices únicos
            const indices = [...new Set(apiData.map(d => d.index_name))];

            // Para cada índice, un punto por fecha (null si no hay dato ese día)
            const series = indices.map(index_name => {
                const porFecha = {};
                apiData
                    .filter(d => d.index_name === index_name)
                    .forEach(d => { porFecha[d.date] = parseFloat(d.close); });

                return {
                    name: index_name,
                    data: fechas.map(f => porFecha[f] ?? null)
                };
            });

            Highcharts.chart(chartContainer, {
                chart: { type: 'bar' },
                title: { text: 'Precio de Cierre por Índice y Fecha' },
                subtitle: { text: 'Todos los índices bursátiles · Datos completos API' },
                accessibility: { enabled: false },
                xAxis: {
                    categories: fechas,
                    title: { text: 'Fecha' }
                },
                yAxis: {
                    title: { text: 'Precio de Cierre (pts)' }
                },
                tooltip: {
                    valueSuffix: ' pts'
                },
                plotOptions: {
                    bar: {
                        grouping: true,
                        dataLabels: { enabled: false }
                    }
                },
                series
            });

        } catch (error) {
            console.error('Error al montar la gráfica:', error);
            errorMessage = 'Error técnico al inicializar el gráfico.';
        }
    });
</script>

<main>
    <h2>Análisis Integrado: Mercados Bursátiles Globales</h2>

    {#if errorMessage}
        <div class="alert">{errorMessage}</div>
    {/if}

    <div bind:this={chartContainer} class="chart-container"></div>

    <div class="back-button">
        <a href="/analytics/daily-global-stock-market-indicators" class="btn-back">← Volver al análisis individual</a>
    </div>
</main>

<style>
    h2 {
        text-align: center;
        color: #1a202c;
        margin-bottom: 20px;
    }

    .chart-container {
        width: 100%;
        height: 600px;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
    }

    .alert {
        color: #721c24;
        background-color: #f8d7da;
        padding: 10px;
        border-radius: 4px;
        text-align: center;
        margin-bottom: 10px;
        border: 1px solid #f5c6cb;
    }

    .back-button {
        display: flex;
        justify-content: center;
        margin-top: 24px;
    }

    .btn-back {
        display: inline-block;
        padding: 10px 20px;
        background-color: #4a5568;
        color: white;
        text-decoration: none;
        border-radius: 6px;
        transition: background-color 0.2s;
    }

    .btn-back:hover { background-color: #2d3748; }
</style>