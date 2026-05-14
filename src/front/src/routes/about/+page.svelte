<script>
    // Configuración centralizada del proyecto SOS2526-23
    const projectInfo = {
        title: "SOS2526-23",
        description: "Our research focuses on analyzing the complex relationship between Google Ads performance, e-Commerce sales flow, and their impact on stock market index fluctuations. Our objective is identify the patterns that drive digital marketplace liquidity and influence investor sentiment.",
        repoUrl: "https://github.com/gti-sos/SOS2526-23",
        deployUrl: "https://sos2526-23.onrender.com",
        team: [
            { name: "David Ayllón Vela", github: "https://github.com/davidayllon8" },
            { name: "Emilio Cuevas Rendón", github: "https://github.com/Cuevas2004" },
            { name: "María Rodríguez Romero", github: "https://github.com/mariarguezro" }
        ],
        apis: [
            { url: "https://sos2526-23.onrender.com/api/v1/global-ads-performance/docs", developer: "David Ayllón Vela" },
            { url: "https://sos2526-23.onrender.com/api/v1/daily-global-stock-market-indicators/docs", developer: "Emilio Cuevas Rendón" },
            { url: "https://sos2526-23.onrender.com/api/v1/online-sales-popular-marketplaces/docs", developer: "María Rodríguez Romero" }
        ],
        videos: [
            { title: "Video David Ayllón", url: "https://youtu.be/m4d0QvaXlGA" }, // Actualizado con tu link de YouTube
            { title: "Video Emilio", url: "#" },
            { title: "Video María", url: "#" }
        ]
    };
</script>

<svelte:head>
    <title>{projectInfo.title}</title>
</svelte:head>

<style>
    /* Estilos globales y contenedores */
    :global(body) {
        font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background-color: #f4f7f6;
        color: #333;
        margin: 0;
        padding: 0;
    }

    .container {
        max-width: 800px;
        margin: 40px auto;
        padding: 40px;
        background-color: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    h1 {
        text-align: center;
        color: #1a202c;
        margin-top: 0;
        margin-bottom: 20px;
    }

    h2 {
        color: #2d3748;
        font-size: 1.3rem;
        margin-top: 35px;
        margin-bottom: 15px;
    }

    .description {
        text-align: center;
        color: #4a5568;
        font-size: 1.05rem;
        line-height: 1.6;
        margin-bottom: 30px;
        padding-bottom: 25px;
        border-bottom: 2px solid #edf2f7;
    }

    .list-style {
        list-style-type: none;
        padding: 0;
    }

    .list-style li {
        background-color: #f8fafc;
        margin-bottom: 8px;
        padding: 12px 15px;
        border-radius: 6px;
        border-left: 4px solid #007bff;
        font-size: 0.95rem;
    }

    .inline-link {
        color: #007bff;
        text-decoration: none;
        margin-left: 5px;
    }

    .inline-link:hover {
        text-decoration: underline;
    }

    .developer-text {
        color: #6c757d;
        font-size: 0.85rem;
        display: block;
        margin-top: 4px;
    }

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
</style>

<div class="container">
    <h1>{projectInfo.title}</h1>

    <p class="description">{projectInfo.description}</p>

    <h2>Team</h2>
    <ul class="list-style">
        {#each projectInfo.team as member}
            <li>
                <strong>{member.name}</strong> 
                <a class="inline-link" href={member.github} target="_blank">({member.github})</a>
            </li>
        {/each}
    </ul>

    <h2>Repository</h2>
    <a class="github-link" href={projectInfo.repoUrl} target="_blank">
        &rarr; gti-sos/SOS2526-23
    </a>

    <h2>URL</h2>
    <a class="github-link" href={projectInfo.deployUrl} target="_blank">
        &rarr; {projectInfo.deployUrl}
    </a>

    <h2>API's</h2>
    <ul class="list-style">
        {#each projectInfo.apis as api}
            <li>
                <a class="inline-link" style="margin-left: 0; font-weight: 500;" href={api.url} target="_blank">{api.url}</a>
                <span class="developer-text">Developed by: {api.developer}</span>
            </li>
        {/each}
    </ul>

    <h2>Videos</h2>
    <ul class="list-style">
        {#each projectInfo.videos as video}
            <li>
                <a class="inline-link" style="margin-left: 0; font-weight: 500;" href={video.url} target="_blank">{video.title}</a>
            </li>
        {/each}
    </ul>
</div>