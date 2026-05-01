<script>
    import { onMount } from 'svelte';

    let loading = $state(true);
    let error = $state(null);
    let datos = $state([]);

    onMount(async () => {
        try {
            const res = await fetch('/api/v1/integrations/github');
            if (!res.ok) throw new Error('Error ' + res.status);
            datos = await res.json();

            const echarts = await import('echarts');
            const chartDom = document.querySelector('#github-chart');
            const chart = echarts.init(chartDom);

            chart.setOption({
                title: { text: 'Comparativa de frameworks JavaScript en GitHub', left: 'center' },
                tooltip: { trigger: 'axis' },
                legend: { top: 30 },
                radar: {
                    indicator: [
                        { name: 'Stars (k)', max: 250 },
                        { name: 'Forks (k)', max: 55 },
                        { name: 'Issues', max: 5000 }
                    ]
                },
                series: [{
                    type: 'radar',
                    data: datos.map(d => ({
                        name: d.name,
                        value: [
                            Math.round(d.stars / 1000),
                            Math.round(d.forks / 1000),
                            d.issues
                        ]
                    }))
                }]
            });

        } catch (err) {
            console.error('Error:', err);
            error = err.message;
        } finally {
            loading = false;
        }
    });
</script>

<div class="container">
    <h1>GitHub — Comparativa de frameworks JavaScript</h1>
    <p>Comparativa de estrellas, forks e issues de los principales frameworks. Datos obtenidos en tiempo real mediante la API de GitHub.</p>

    {#if error}
        <p class="error">{error}</p>
    {:else}
        <div id="github-chart" style="width:100%;height:450px;"></div>

        {#if loading}
            <p>Cargando datos de GitHub...</p>
        {:else}
            <table>
                <thead>
                    <tr>
                        <th>Repositorio</th>
                        <th>Lenguaje</th>
                        <th>⭐ Stars</th>
                        <th>🍴 Forks</th>
                        <th>🐛 Issues</th>
                    </tr>
                </thead>
                <tbody>
                    {#each datos as d}
                        <tr>
                            <td>{d.name}</td>
                            <td>{d.language}</td>
                            <td>{d.stars.toLocaleString()}</td>
                            <td>{d.forks.toLocaleString()}</td>
                            <td>{d.issues.toLocaleString()}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {/if}
    {/if}

    <a href="/integrations">← Volver a integraciones</a>
</div>

<style>
    .container {
        max-width: 900px;
        margin: 2rem auto;
        padding: 1rem;
        font-family: sans-serif;
    }
    h1 { font-size: 1.6rem; margin-bottom: 0.5rem; }
    p { color: #555; margin-bottom: 1.5rem; }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 2rem;
    }
    th, td {
        padding: 0.75rem 1rem;
        text-align: left;
        border-bottom: 1px solid #ddd;
    }
    th { background: #f5f5f5; font-weight: 600; }
    .error { color: red; }
    a { display: inline-block; margin-top: 1.5rem; color: #333; }
</style>