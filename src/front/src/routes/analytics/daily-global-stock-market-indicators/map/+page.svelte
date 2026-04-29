<script>
    import { onMount } from 'svelte';
    import L from 'leaflet';

    let map;
    let data = [];

    // Diccionario base. Si los nombres en tu API son distintos,
    // cámbialos aquí para que coincidan EXACTAMENTE con lo que sale en la consola.
    const coordenadasIndices = {
        "S&P 500": [40.7128, -74.0060],
        "Dow Jones": [40.7128, -74.0060],
        "NASDAQ Composite": [40.7128, -74.0060],
        "FTSE 100": [51.5074, -0.1278],
        "DAX": [50.1109, 8.6821],
        "CAC 40": [48.8566, 2.3522],
        "Nikkei 225": [35.6895, 139.6917],
        "Hang Seng": [22.3193, 114.1694],
        "SSE Composite": [31.2304, 121.4737]
    };

    onMount(async () => {
        // Inicializar el mapa
        map = L.map('mapa-container').setView([30, 0], 2);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        try {
            // ¡CORRECCIÓN AQUÍ! Cambiado a v1 para que coincida con tu otro gráfico
            const response = await fetch('/api/v1/daily-global-stock-market-indicators');
            
            if (response.ok) {
                data = await response.json();
                
                // Chivato en la consola para ver qué nombres exactos tienes en tu API
                console.log("Datos cargados de la API (v1):", data); 

                data.forEach(indicador => {
                    const nombreIndice = indicador.index_name; 
                    const coords = coordenadasIndices[nombreIndice];
                    
                    if (coords) {
                        const marker = L.circleMarker(coords, {
                            radius: 8, fillColor: "#3388ff", color: "#000", weight: 1, opacity: 1, fillOpacity: 0.8
                        }).addTo(map);

                        // Ajustados los nombres de las propiedades a como los tenías en el gráfico de burbujas
                        marker.bindPopup(`
                            <b>${nombreIndice}</b><br>
                            Región: ${indicador.region}<br>
                            Cierre: ${indicador.close}<br>
                            Cambio Diario: ${indicador.daily_change_percent}%
                        `);
                    } else {
                        // Si falta algún índice en el diccionario, te avisará en la consola
                        console.warn(`Revisa este nombre: No hay coordenadas configuradas para "${nombreIndice}"`);
                    }
                });
            }
        } catch (error) {
            console.error("Error cargando los datos de la API:", error);
        }
    });
</script>

<svelte:head>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
</svelte:head>

<main>
    <h2>Mapa Global de Índices Bursátiles</h2>
    <p>Visualización geoespacial de los mercados analizados.</p>
    
    <div id="mapa-container"></div>
    
    <div class="back-link">
        <a href="/analytics/daily-global-stock-market-indicators">← Volver al gráfico de burbujas</a>
    </div>
</main>

<style>
    main {
        max-width: 1000px;
        margin: 0 auto;
        padding: 20px;
    }

    #mapa-container {
        height: 600px;
        width: 100%;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        margin-top: 20px;
        z-index: 1;
    }

    .back-link {
        margin-top: 20px;
        text-align: center;
    }

    .back-link a {
        color: #0056b3;
        text-decoration: none;
        font-weight: bold;
    }

    .back-link a:hover {
        text-decoration: underline;
    }
</style>