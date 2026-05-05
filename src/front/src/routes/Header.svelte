<header>
    <div class="nav-container">
        <a href="/" class="logo" aria-label="Volver al inicio">SOS2526-23</a>
        
        <nav aria-label="Navegación principal">
            <a href="/" class="nav-link">Inicio</a>
            <a href="https://github.com/gti-sos/SOS2526-23" target="_blank" rel="noopener noreferrer" class="github-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" class="github-icon">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>GitHub</span>
            </a>
             <a href="/about" class="nav-link">Acerca de</a>
        </nav>
    </div>
</header>

<style>
    /* Variables CSS para facilitar el mantenimiento y consistencia */
    :root {
        --header-bg: rgba(255, 255, 255, 0.85);
        --text-main: #0f172a;
        --text-muted: #475569;
        --primary-color: #2563eb;
        --primary-bg: #eff6ff;
        --primary-hover: #dbeafe;
    }

    header {
        background-color: var(--header-bg);
        /* Efecto de cristal esmerilado (Glassmorphism) para un look premium */
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border-bottom: 1px solid rgba(226, 232, 240, 0.6);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.025);
        padding: 1rem 0;
        position: sticky;
        top: 0;
        z-index: 50;
    }
    
    .nav-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 0 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .logo {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-main);
        text-decoration: none;
        letter-spacing: -0.025em;
        transition: opacity 0.2s ease;
    }

    .logo:hover {
        opacity: 0.8;
    }

    nav {
        display: flex;
        gap: 1.5rem;
        align-items: center;
    }

    .nav-link {
        text-decoration: none;
        color: var(--text-muted);
        font-weight: 500;
        font-size: 0.95rem;
        transition: all 0.2s ease;
    }

    .nav-link:hover {
        color: var(--primary-color);
    }

    .github-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background-color: var(--primary-bg);
        color: var(--primary-color);
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 0.95rem;
        transition: all 0.2s ease;
    }

    .github-btn:hover {
        background-color: var(--primary-hover);
        transform: translateY(-1px);
    }

    .github-icon {
        flex-shrink: 0;
    }
</style>