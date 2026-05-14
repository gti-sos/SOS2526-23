<script>
    import { onMount } from 'svelte';
    import c3 from 'c3';
    import 'c3/c3.css';

    // CAMBIO AQUÍ: En Svelte 5 usamos $props()
    let { data } = $props(); 

    let chartContainer;

    onMount(() => {
        // El resto del código se mantiene igual...
        if (data.chartData) {
            c3.generate({
                bindto: chartContainer,
                data: {
                    columns: [
                        data.chartData.prices,
                        data.chartData.durations
                    ],
                    type: 'bar',
                    axes: { 'Duración (min)': 'y2' }
                },
                axis: {
                    x: {
                        type: 'category',
                        categories: data.chartData.titles,
                        tick: { rotate: 45, multiline: false }
                    },
                    y2: { show: true, label: 'Minutos' }
                }
            });
        }
    });
</script>


<main>
    <h1>Análisis de Películas: Marvel (iTunes API)</h1>
    <div class="chart-box">
        <div bind:this={chartContainer}></div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Portada</th>
                <th>Título</th>
                <th>Género</th>
                <th>Precio</th>
            </tr>
        </thead>
        <tbody>
            {#each data.movieList as movie}
            <tr>
                <td><img src={movie.artworkUrl60} alt="poster" /></td>
                <td>{movie.trackName}</td>
                <td>{movie.primaryGenreName}</td>
                <td class="price">${movie.trackRentalPrice || 'N/A'}</td>
            </tr>
            {/each}
        </tbody>
    </table>
</main>

<style>
    main { max-width: 900px; margin: 0 auto; padding: 2rem; font-family: system-ui; }
    .chart-box { background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    table { width: 100%; border-collapse: collapse; margin-top: 2rem; }
    th { text-align: left; background: #edf2f7; padding: 10px; }
    td { padding: 10px; border-bottom: 1px solid #eee; }
    .price { font-weight: bold; color: #2b6cb0; }
</style>