
export async function load({ fetch }) {
    // API de Apple: No necesita Key. Buscamos películas de Marvel.
    const url = 'https://itunes.apple.com/search?term=marvel&entity=movie&limit=12';
    try {
        const response = await fetch(url);
        const data = await response.json();
        const movies = data.results;
        // Formateamos los datos para que C3.js los entienda fácilmente
        return {
            chartData: {
                titles: movies.map(m => m.trackName),
                // Primer elemento es la etiqueta de la serie de datos
                prices: ['Precio Alquiler ($)', ...movies.map(m => m.trackRentalPrice || 0)],
                durations: ['Duración (min)', ...movies.map(m => Math.round(m.trackTimeMillis / 60000))]
            },
        movieList: movies
        };
    } catch (error) {
        console.error(error);
        return { movieList: [], error: 'Error al conectar con la API' };
    }
}