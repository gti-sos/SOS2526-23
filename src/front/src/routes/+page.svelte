<script>
    // Tu lógica de script iría aquí si la necesitas en el futuro
</script>

<style>
    /* Estilos globales básicos aplicados solo a esta vista para mejorar la fuente y el fondo */
    :global(body) {
        font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background-color: #f9fafb; /* Nuevo color de fondo general */
        color: #1f2937; /* Gris oscuro para el texto principal */
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: center;
        min-height: 100vh;
    }

    /* Contenedor principal centrado con estructura de tarjeta profesional */
    .container {
        max-width: 900px;
        margin: 20px auto;
        padding: 40px;
        background-color: #ffffff; /* Blanco para el contenedor */
        border-radius: 12px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    /* Títulos con mejor jerarquía y espaciado */
    h1 {
        text-align: center;
        color: #111827; /* Gris muy oscuro */
        margin-top: 0;
        margin-bottom: 30px;
        padding-bottom: 15px;
        border-bottom: 2px solid #e5e7eb;
    }

    h2 {
        color: #1f2937;
        font-size: 1.3rem;
        margin-top: 35px;
        margin-bottom: 15px;
        font-weight: 600;
    }

    /* Secciones claras */
    .section {
        margin-bottom: 40px;
    }

    /* Lista del equipo limpia y estilizada */
    .team-list {
        list-style-type: none;
        padding: 0;
    }

    .team-list li {
        margin-bottom: 12px;
        padding: 15px 20px;
        background-color: #f3f4f6;
        border-radius: 8px;
        border-left: 4px solid #3b82f6; /* Color de acento */
        font-size: 0.95rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .team-list li span {
        color: #6b7280;
    }

    /* Enlace de Github más profesional */
    .github-link {
        display: inline-flex;
        align-items: center;
        color: #3b82f6;
        text-decoration: none;
        font-weight: 500;
        padding: 12px 20px;
        background-color: #eff6ff;
        border-radius: 8px;
        transition: background-color 0.2s;
    }

    .github-link:hover {
        background-color: #dbeafe;
    }
    
    /* Nota "REVISAR" integrada con el título */
    .status-badge {
        font-size: 0.8rem;
        padding: 3px 8px;
        border-radius: 999px;
        background-color: #fef3c7;
        color: #d97706;
        font-weight: bold;
        margin-left: 10px;
    }

    /* Agrupación uniforme de botones con Flexbox */
    .button-group {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
    }

    /* Botones mejorados con diseño moderno y efectos hover */
    .buttonEnlace {
        display: inline-block;
        padding: 10px 20px;
        background-color: #3b82f6; /* Nuevo color de acento profesional */
        color: white;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 500;
        font-size: 0.95rem;
        transition: background-color 0.2s ease-in-out;
        box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
    }

    .buttonEnlace:hover {
        background-color: #2563eb;
    }

    /* Pie de página sutil */
    .footer {
        text-align: center;
        color: #6b7280;
        margin-top: 50px;
        font-size: 0.9rem;
    }
</style>

<div class="container">
    <h1>SOS2526-23</h1>

    <div class="section team-section">
        <h2>Team</h2>
        <ul class="team-list">
            <li><strong>David Ayllón Vela</strong> <span>global-ads-performance</span></li>
            <li><strong>Emilio Cuevas Rendón</strong> <span>daily-global-stock-market-indicators</span></li>
            <li><strong>María Rodríguez Romero</strong> <span>online-sales-popular-marketplaces</span></li>
        </ul>
    </div>

    <div class="section github-section">
        <h2>Repositorio de Github</h2>
        <a class="github-link" href="https://github.com/gti-sos/SOS2526-23" target="_blank">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
            https://github.com/gti-sos/SOS2526-23
        </a>
    </div>

    <div class="section front-section">
        <h2>Front-end individual <span class="status-badge">REVISAR</span></h2>
        <div class="button-group">
            <a class="buttonEnlace" href="/DAV" target="_blank">DAV</a>
            <a class="buttonEnlace" href="/ECR" target="_blank">ECR</a>
            <a class="buttonEnlace" href="/MRR" target="_blank">MRR</a>
        </div>
    </div>

    <div class="section api-section">
        <h2>API's desarrolladas</h2>
        <div class="button-group">
            <a class="buttonEnlace" href="/api/v1/global-ads-performance" target="_blank">global-ads-performance</a>
            <a class="buttonEnlace" href="/api/v1/daily-global-stock-market-indicators" target="_blank">daily-global-stock-market-indicators</a>
            <a class="buttonEnlace" href="/api/v1/online-sales-popular-marketplaces" target="_blank">online-sales-popular-marketplaces</a>
        </div>
    </div>

    <div class="section postman-section">
        <h2>Documentación de Postman</h2>
        <div class="button-group">
            <a class="buttonEnlace" href="https://documenter.getpostman.com/view/52707486/2sBXigLYQP" target="_blank">global-ads-performance</a>
            <a class="buttonEnlace" href="https://documenter.getpostman.com/view/52708852/2sBXigLYL8" target="_blank">daily-global-stock-market-indicators</a>
            <a class="buttonEnlace" href="https://documenter.getpostman.com/view/52406430/2sBXigLYQR" target="_blank">online-sales-popular-marketplaces</a>
        </div>
    </div>

    <p class="footer">Built in Svelte</p>
</div>