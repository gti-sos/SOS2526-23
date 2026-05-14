<footer>
    <div class="footer-container">
        <!-- Copyright con el año y nombre del equipo -->
        <p>&copy; 2026 Equipo SOS2526-23</p>
        <!-- Tecnología usada en el proyecto -->
        <p class="tech-stack">Built with <span>Svelte</span></p>
    </div>
</footer>

<style>
    footer {
        background-color: #2d3748; /* Color de fondo oscuro del footer */
        color: #f8fafc; /* Texto claro para que contraste con el fondo */
        padding: 30px 0;
        margin-top: 60px; /* Separación respecto al contenido de arriba */
    }

    .footer-container {
        max-width: 800px; /* Mismo ancho máximo que el resto de la app */
        margin: 0 auto; /* Centrado horizontal */
        padding: 0 40px;
        display: flex;
        justify-content: space-between; /* Copyright a la izquierda, tech a la derecha */
        align-items: center;
        font-size: 0.95rem;
    }

    p {
        margin: 0; /* Quitamos el margen por defecto del párrafo */
    }

    .tech-stack span {
        color: #dbeafe; /* Azul claro para resaltar "Svelte" */
        font-weight: bold;
    }
</style>