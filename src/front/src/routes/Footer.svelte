<footer>
    <div class="footer-container">
        <p>&copy; 2026 Equipo SOS2526-23</p>
        <p class="tech-stack">Built with <span>Svelte</span></p>
    </div>
</footer>

<style>
    footer {
        background-color: #2d3748; /* Tu color oscuro secundario */
        color: #f8fafc; /* Un gris muy claro/blanco para buen contraste */
        padding: 30px 0;
        margin-top: 60px;
    }

    .footer-container {
        max-width: 800px; /* Alineado con tu contenedor principal */
        margin: 0 auto;
        padding: 0 40px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.95rem;
    }

    p {
        margin: 0;
    }

    .tech-stack span {
        color: #dbeafe; /* El azul claro de tus hovers para resaltar la tecnología */
        font-weight: bold;
    }
</style>