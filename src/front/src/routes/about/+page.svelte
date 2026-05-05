<script>
    // Separamos la información en un objeto para mantener el template limpio y fácil de mantener
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
        ]
    };
</script>

<svelte:head>
    <title>{projectInfo.title}</title>
</svelte:head>

<h1>{projectInfo.title}</h1>

<hr>

<ul>
    <li><b>Team</b>:
        <ul style="list-style-type: '-'">
            {#each projectInfo.team as member}
                <li> &nbsp; {member.name} (<a href={member.github} target="_blank">{member.github}</a>)</li>
            {/each}
        </ul>
    </li>
    
    <br>
    
    <li><b>Project description</b>: {projectInfo.description}</li>
    
    <br>
    
    <li><b>Repository</b>: <a href={projectInfo.repoUrl} target="_blank">gti-sos/SOS2526-23</a></li>
    
    <br>
    
    <li><b>URL</b>: <a href={projectInfo.deployUrl} target="_blank">{projectInfo.deployUrl}</a></li>
    
    <li><b>API's</b>:
        <ul style="list-style-type: '-'">
            {#each projectInfo.apis as api}
                <li> &nbsp; <a href={api.url} target="_blank">{api.url}</a> (developed by {api.developer})</li>
            {/each}
        </ul>
    </li>
</ul>