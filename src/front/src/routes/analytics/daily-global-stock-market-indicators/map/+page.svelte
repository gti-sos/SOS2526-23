<script>
    // Importamos onMount, que es como decirle a Svelte: "Oye, ejecuta esto cuando la página ya esté cargada y lista"
    import { onMount } from 'svelte';
    
    // Importamos Leaflet, que es la librería que hace la magia de pintar el mapa y los marcadores
    import L from 'leaflet';

    // Creamos dos variables vacías. Una guardará nuestro mapa y otra los datos que nos mande el backend
    let map;
    let data = [];

    // Este diccionario es clave. Como la API nos da el nombre del mercado pero no su latitud/longitud,
    // aquí "traducimos" el nombre (ej: S&P 500) a las coordenadas del país donde cotiza.
    // OJO: Los nombres de la izquierda tienen que ser igualitos a los que devuelve la API.
    const coordenadasIndices = {
        "S&P 500": [40.7128, -74.0060], // Wall Street, Nueva York
        "Dow Jones": [40.7128, -74.0060],
        "NASDAQ Composite": [40.7128, -74.0060],
        "FTSE 100": [51.5074, -0.1278], // Londres
        "DAX": [50.1109, 8.6821], // Frankfurt
        "CAC 40": [48.8566, 2.3522], // París
        "Nikkei 225": [35.6895, 139.6917], // Tokio
        "Hang Seng": [22.3193, 114.1694], // Hong Kong
        "SSE Composite": [31.2304, 121.4737] // Shanghái
    };

    // Todo lo que hay dentro de onMount se ejecuta cuando el navegador termina de pintar el HTML
    onMount(async () => {
        // 1. DIBUJAR EL MAPA BASE
        // Enganchamos el mapa de Leaflet al <div> de abajo que tiene el id="mapa-container".
        // Le decimos que empiece centrado en [30, 0] (cerca del ecuador) y con zoom 2 (para ver casi todo el mundo)
        map = L.map('mapa-container').setView([30, 0], 2);

        // Cargamos las "losetas" o imágenes del mapa desde OpenStreetMap (como si fueran los trozos de un puzzle)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors' // Hay que poner esto por temas de licencia
        }).addTo(map);

        // 2. PEDIR DATOS A NUESTRA API
        try {
            // Hacemos un fetch a nuestro backend para que nos dé los datos de los mercados
            const response = await fetch('/api/v1/daily-global-stock-market-indicators');
            
            // Si el backend nos responde con un 200 OK (todo bien)
            if (response.ok) {
                // Transformamos la respuesta en un JSON (un array de datos en JavaScript)
                data = await response.json();
                
                // Chivato en la consola para comprobar que los datos llegan bien (ideal para depurar si algo falla)
                console.log("Datos cargados de la API (v1):", data); 

                // 3. PINTAR LOS MARCADORES EN EL MAPA
                // Recorremos uno a uno cada mercado que nos ha mandado el backend
                data.forEach(indicador => {
                    // Guardamos el nombre del índice de este indicador en concreto (ej: "FTSE 100")
                    const nombreIndice = indicador.index_name; 
                    
                    // Buscamos ese nombre en nuestro diccionario de arriba para sacar sus coordenadas [lat, lon]
                    const coords = coordenadasIndices[nombreIndice];
                    
                    // Si hemos encontrado coordenadas para este mercado...
                    if (coords) {
                        // Creamos un marcador circular (un puntito) en esas coordenadas. Le ponemos color azul, bordes, etc.
                        const marker = L.circleMarker(coords, {
                            radius: 8, fillColor: "#3388ff", color: "#000", weight: 1, opacity: 1, fillOpacity: 0.8
                        }).addTo(map); // Y lo pegamos en el mapa

                        // Al marcador le atamos un "Popup". Es el cuadrito blanco que sale cuando haces clic en el punto.
                        // Usamos código HTML básico (<b> para negrita, <br> para salto de línea) y le metemos las variables.
                        marker.bindPopup(`
                            <b>${nombreIndice}</b><br>
                            Región: ${indicador.region}<br>
                            Cierre: ${indicador.close}<br>
                            Cambio Diario: ${indicador.daily_change_percent}%
                        `);
                    } else {
                        // Si el backend manda un mercado que NO está en nuestro diccionario, el mapa no sabe dónde pintarlo.
                        // Lanzamos un aviso por consola para darnos cuenta y añadirlo al diccionario luego.
                        console.warn(`Revisa este nombre: No hay coordenadas configuradas para "${nombreIndice}"`);
                    }
                });
            }
        } catch (error) {
            // Si el fetch falla (ej: el backend está apagado o hay un error de red), chivamos el error por consola
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
    /* CSS para que todo se vea bien centrado, con márgenes y que el contenedor del mapa tenga el tamaño correcto */
    main {
        max-width: 1000px;
        margin: 0 auto;
        padding: 20px;
    }

    #mapa-container {
        height: 600px; /* Si no le damos altura, el mapa no se ve (altura 0 por defecto) */
        width: 100%;
        border-radius: 8px; /* Bordes redondeaditos */
        box-shadow: 0 4px 8px rgba(0,0,0,0.1); /* Una sombrita para que parezca que flota */
        margin-top: 20px;
        z-index: 1; /* Esto asegura que el mapa no tape menús desplegables que tengáis por arriba */
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
        text-decoration: underline; /* Efecto al pasar el ratón */
    }
</style>