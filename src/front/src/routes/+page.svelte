<script>
    // Tu lógica de script iría aquí si la necesitas en el futuro
</script>

<style>
    /* Estilos globales básicos aplicados solo a esta vista para mejorar la fuente y el fondo */
    :global(body) {
        font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background-color: #f4f7f6;
        color: #333;
        margin: 0;
        padding: 0;
    }

    /* Contenedor principal tipo tarjeta */
    .container {
        max-width: 800px;
        margin: 40px auto;
        padding: 40px;
        background-color: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    /* Títulos */
    h1 {
        text-align: center;
        color: #1a202c;
        margin-top: 0;
        margin-bottom: 30px;
        padding-bottom: 15px;
        border-bottom: 2px solid #edf2f7;
    }

    h2 {
        color: #2d3748;
        font-size: 1.3rem;
        margin-top: 35px;
        margin-bottom: 15px;
    }

    /* Lista del equipo */
    .team-list {
        list-style-type: none;
        padding: 0;
    }

    .team-list li {
        background-color: #f8fafc;
        margin-bottom: 8px;
        padding: 12px 15px;
        border-radius: 6px;
        border-left: 4px solid #007bff;
        font-size: 0.95rem;
    }

    /* Enlace de Github */
    .github-link {
        display: inline-flex;
        align-items: center;
        color: #007bff;
        text-decoration: none;
        font-weight: 500;
        padding: 10px 15px;
        background-color: #ebf4ff;
        border-radius: 6px;
        transition: background-color 0.2s;
    }

    .github-link:hover {
        background-color: #dbeafe;
    }

    /* Agrupación de botones */
    .button-group {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
    }

    /* Botones mejorados */
    .buttonEnlace {
        display: inline-block;
        padding: 10px 20px;
        background-color: #007bff;
        color: white;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 500;
        font-size: 0.95rem;
        transition: all 0.2s ease-in-out;
        box-shadow: 0 2px 4px rgba(0, 123, 255, 0.2);
    }

    .buttonEnlace:hover {
        background-color: #0056b3;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
    }
    
</style>

<div class="container">
    <h1>SOS2526-23</h1>

    <h2>Team</h2>
    <ul class="team-list">
        <li><strong>David Ayllón Vela</strong> - global-ads-performance</li>
        <li><strong>Emilio Cuevas Rendón</strong> - daily-global-stock-market-indicators</li>
        <li><strong>María Rodríguez Romero</strong> - online-sales-popular-marketplaces</li>
    </ul>

    <h2>Repositorio de Github</h2>
    <a class="github-link" href="https://github.com/gti-sos/SOS2526-23" target="_blank">
        &rarr; https://github.com/gti-sos/SOS2526-23
    </a>

    <h2>Front-end individual</h2>
    <div class="button-group">
        <a class="buttonEnlace" href="/global-ads-performance" target="_blank">DAV</a>
        <a class="buttonEnlace" href="/daily-global-stock-market-indicators" target="_blank">ECR</a>
        <a class="buttonEnlace" href="/MRR" target="_blank">MRR</a>
    </div>

    <h2>API's desarrolladas</h2>
    <div class="button-group">
        <a class="buttonEnlace" href="/api/v1/global-ads-performance" target="_blank">global-ads-performance</a>
        <a class="buttonEnlace" href="/api/v1/daily-global-stock-market-indicators" target="_blank">daily-global-stock-market-indicators</a>
        <a class="buttonEnlace" href="/api/v1/online-sales-popular-marketplaces" target="_blank">online-sales-popular-marketplaces</a>
    </div>

    <h2>Documentación de Postman</h2>
    <div class="button-group">
        <a class="buttonEnlace" href="https://documenter.getpostman.com/view/52707486/2sBXigLYQP" target="_blank">global-ads-performance</a>
        <a class="buttonEnlace" href="https://documenter.getpostman.com/view/52708852/2sBXigLYL8" target="_blank">daily-global-stock-market-indicators</a>
        <a class="buttonEnlace" href="https://documenter.getpostman.com/view/52406430/2sBXigLYQR" target="_blank">online-sales-popular-marketplaces</a>
    </div>
</div>