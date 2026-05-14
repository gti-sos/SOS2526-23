// =====================================================================
// 1. IMPORTACIONES Y CONFIGURACIÓN INICIAL (Se ejecuta de forma SÍNCRONA al inicio)
// =====================================================================
//[ARRANQUE - PASO 1]: Node.js lee el archivo de arriba a abajo e importa las librerías.");

import util from 'util'; // Importa una herramienta nativa de Node.js para utilidades varias.
util.isDate = function(d) { return d instanceof Date; }; // Parche para comprobar si algo es una fecha.
util.isRegExp = function(re) { return re instanceof RegExp; }; // Parche para comprobar si algo es una expresión regular.

import https from 'https'; // Importa la librería para hacer peticiones web seguras.
import Datastore from 'nedb'; // Importa NeDB, nuestra base de datos en un archivo local.
import cors from 'cors'; // Importa CORS, el vigilante que permite que nuestro Frontend hable con nuestro Backend.

// Creamos un agente para ignorar errores de certificados SSL caducados en APIs externas (necesario a veces en Render).
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// Guardamos en una variable la ruta base para no tener que escribir "/api/v1" en cada endpoint.
const BASE_URL_API = "/api/v1";

// Definimos estrictamente los campos que aceptamos. Si un usuario manda algo distinto, lo rechazaremos.
const CAMPOS_REQUERIDOS = ['date', 'index_name', 'region', 'open', 'high', 'low', 'close', 'volume', 'daily_change_percent'];

// Función auxiliar: Comprueba que el objeto (body) que nos envían tiene exactamente los campos requeridos.
function validarEstructura(body) {
    if (!body || typeof body !== 'object') return false; // Si no hay body o no es un objeto JSON, falla.
    const tieneExactos = CAMPOS_REQUERIDOS.every(c => body.hasOwnProperty(c)); // Comprueba que están todos los obligatorios.
    const noTieneExtras = Object.keys(body).every(c => CAMPOS_REQUERIDOS.includes(c)); // Comprueba que no hay campos inventados.
    return tieneExactos && noTieneExtras; // Solo devuelve 'true' si cumple ambas condiciones.
}

// Función auxiliar: NeDB le pone un "_id" secreto a cada dato. Esta función hace una copia del dato y le borra ese "_id" para no mostrarlo al público.
function limpiarId(doc) {
    const copy = { ...doc }; // Hacemos una copia exacta del documento.
    delete copy._id; // Borramos el campo '_id' de la copia.
    return copy; // Devolvemos el documento ya limpio.
}

// =====================================================================
// 2. FUNCIÓN PRINCIPAL QUE EXPORTAMOS AL SERVIDOR (index.js)
// =====================================================================
export function loadBackEndECR(app) {
    
    //[ARRANQUE - PASO 2]: El servidor llama a esta función para cargar nuestras rutas.");

    app.use(cors()); // Le decimos a nuestra app (Express) que use CORS para no bloquear al Frontend.
    
    // Array con datos "semilla" por si la base de datos está vacía al arrancar.
    const datosIndices = [
        { date: "2024-01-01", index_name: "S&P 500", region: "North America", open: 37740.57, high: 38171.04, low: 37552.74, close: 38125.97, volume: 34594679, daily_change_percent: 1.02 },
        { date: "2024-01-01", index_name: "NASDAQ Composite", region: "North America", open: 12519.37, high: 12926.14, low: 12249.50, close: 12654.15, volume: 39548535, daily_change_percent: 1.08 },
        { date: "2024-01-01", index_name: "Dow Jones", region: "North America", open: 39555.85, high: 39966.85, low: 39531.34, close: 39740.61, volume: 8398121, daily_change_percent: 0.47 },
        { date: "2024-01-01", index_name: "FTSE 100", region: "Europe", open: 18850.59, high: 19341.92, low: 18646.31, close: 19214.54, volume: 44763368, daily_change_percent: 1.93 },
        { date: "2024-01-01", index_name: "Nikkei 225", region: "Asia", open: 15708.36, high: 15734.90, low: 15130.62, close: 15396.17, volume: 41135726, daily_change_percent: -1.99 },
        { date: "2024-01-01", index_name: "Hang Seng", region: "Asia", open: 4023.53, high: 4218.66, low: 4007.54, close: 4104.75, volume: 39061503, daily_change_percent: 2.02 },
        { date: "2024-01-01", index_name: "DAX", region: "Europe", open: 19256.09, high: 19262.37, low: 18884.10, close: 18898.03, volume: 25254324, daily_change_percent: -1.86 },
        { date: "2024-01-01", index_name: "CAC 40", region: "Europe", open: 4264.55, high: 4502.93, low: 3711.50, close: 3997.91, volume: 12578040, daily_change_percent: -6.25 },
        { date: "2024-01-01", index_name: "SSE Composite", region: "Asia", open: 15689.85, high: 16064.29, low: 15579.67, close: 15986.31, volume: 35348196, daily_change_percent: 1.89 },
        { date: "2024-01-01", index_name: "KSE 100", region: "Asia", open: 11151.06, high: 11422.02, low: 11009.70, close: 11312.65, volume: 33074534, daily_change_percent: 1.45 }
    ];

    // Conectamos con el archivo de la base de datos (si no existe, NeDB lo crea).
    const db = new Datastore({ filename: './dailyIndicators.db', autoload: true });

    // AUTO-CARGA INICIAL (Búsqueda Asíncrona)
    // Le pedimos a la BD que busque todo ({}). Mientras busca, el código sigue leyendo hacia abajo.
    db.find({}, (err, docs) => {
        //[ARRANQUE - PASO 3]: La BD contestó. Vemos si está vacía para meter los datos iniciales.");
        if (!err && docs.length === 0) { // Si no hay errores y la BD tiene 0 elementos...
            db.insert(datosIndices, (insertErr) => { // ...insertamos los de prueba.
                if (insertErr) {
                    console.error("❌ Error al insertar datos iniciales ECR:", insertErr); // Si falla, avisamos en consola.
                } else {
                    console.log("✅ Datos iniciales ECR insertados automáticamente:", datosIndices.length, "registros"); // Si acierta, también.
                }
            });
        } else {
            console.log("ℹ️ BD ECR ya tiene datos:", docs.length, "registros"); // Si ya tenía datos, no hacemos nada.
        }
    });

    // =====================================================================
    // 3. RUTAS DE MI API (CRUD de indicadores de bolsa)
    // =====================================================================

    // Redirección a la documentación oficial en Postman.
    app.get(BASE_URL_API + '/daily-global-stock-market-indicators/docs', (req, res) => {
        res.redirect('https://documenter.getpostman.com/view/52708852/2sBXigLYL8'); // Mandamos al cliente a esa web.
    });

    // Endpoint para reiniciar la base de datos a mano (botón "Load Initial Data").
    app.get(BASE_URL_API + '/daily-global-stock-market-indicators/loadInitialData', (req, res) => {
        db.find({}, (err, docs) => { // Buscamos qué hay.
            if (err) return res.status(500).json({ message: "Internal Server Error" }); // Si la BD explota, error 500.
            if (docs.length === 0) { // Si está vacía de verdad...
                db.insert(datosIndices, (err, newDocs) => { // Insertamos los datos semilla.
                    if (err) return res.status(500).json({ message: "Internal Server Error" });
                    res.status(201).json(newDocs.map(limpiarId)); // Devolvemos 201 (Creado) y los datos sin el '_id'.
                });
            } else {
                res.status(409).json({ message: "Conflict: Ya existen datos" }); // 409: Conflicto. Ya hay datos, bórralos primero.
            }
        });
    });

    // BÚSQUEDA GENERAL (GET): Devuelve datos y permite filtrar y paginar.
    app.get(BASE_URL_API + '/daily-global-stock-market-indicators', (req, res) => {
        
        //[PETICIÓN GET - PASO 1]: Un usuario nos pide datos. Empezamos a preparar los filtros.");

        const searchQuery = {}; // Creamos un objeto vacío que servirá de filtro.
        
        // Si en la URL ponen "?date=X", lo añadimos al filtro buscando de forma flexible (RegExp 'i' = ignora mayúsculas).
        if (req.query.date)       searchQuery.date       = new RegExp(req.query.date, 'i');
        if (req.query.index_name) searchQuery.index_name = new RegExp(req.query.index_name, 'i');
        if (req.query.region)     searchQuery.region     = new RegExp(req.query.region, 'i');
        // Para los números, los convertimos de texto (URL) a números reales (Float o Int) antes de buscar.
        if (req.query.open)                 searchQuery.open                 = parseFloat(req.query.open);
        if (req.query.high)                 searchQuery.high                 = parseFloat(req.query.high);
        if (req.query.low)                  searchQuery.low                  = parseFloat(req.query.low);
        if (req.query.close)                searchQuery.close                = parseFloat(req.query.close);
        if (req.query.volume)               searchQuery.volume               = parseInt(req.query.volume);
        if (req.query.daily_change_percent) searchQuery.daily_change_percent = parseFloat(req.query.daily_change_percent);

        let dbQuery = db.find(searchQuery); // Preparamos la consulta a la BD con los filtros.
        
        // PAGINACIÓN: Límite (cuántos devuelvo) y Offset (cuántos me salto).
        if (req.query.limit) {
            const limit = parseInt(req.query.limit); // Lo convertimos a número.
            if (!isNaN(limit) && limit >= 0) dbQuery = dbQuery.limit(limit); // Si es un número válido, aplicamos el límite a la búsqueda.
        }
        if (req.query.offset) {
            const offset = parseInt(req.query.offset);
            if (!isNaN(offset) && offset >= 0) dbQuery = dbQuery.skip(offset); // Si es válido, aplicamos el salto (skip).
        }
        
        // Ejecutamos la búsqueda de forma asíncrona.
        dbQuery.exec((err, docs) => {
            //[PETICIÓN GET - PASO 2]: La BD encontró los datos y se los mandamos al usuario.");
            if (err) return res.status(500).json({ message: "Internal Server Error" });
            res.status(200).json(docs.map(limpiarId)); // Mandamos los datos (limpios de _id) con un 200 OK.
        });
    });

    // CREAR UN REGISTRO (POST)
    app.post(BASE_URL_API + '/daily-global-stock-market-indicators', (req, res) => {
        const newData = req.body; // Cogemos lo que nos manda el usuario.
        
        // Comprobamos que el JSON tiene la estructura perfecta.
        if (!validarEstructura(newData)) {
            return res.status(400).json({ message: "Bad Request: La estructura del JSON no es correcta" }); // 400: Culpa del usuario.
        }
        
        // Buscamos si ya existe ese índice en esa región.
        db.find({ region: newData.region, index_name: newData.index_name }, (err, docs) => {
            if (err) return res.status(500).json({ message: "Internal Server Error" });
            if (docs.length > 0) { // Si ya existe, no le dejamos crearlo otra vez.
                return res.status(409).json({ message: "Conflict: El recurso ya existe" }); // 409: Conflicto.
            }
            // Si no existe, lo guardamos.
            db.insert(newData, (err, newDoc) => {
                if (err) return res.status(500).json({ message: "Internal Server Error" });
                res.status(201).json(limpiarId(newDoc)); // 201: Creado con éxito. Le devolvemos el dato creado.
            });
        });
    });

    // ERROR DE MÉTODO: No permitimos actualizar (PUT) toda la lista de golpe.
    app.put(BASE_URL_API + '/daily-global-stock-market-indicators', (req, res) => {
        res.status(405).json({ message: "Method Not Allowed" }); // 405: Método no permitido.
    });

    // BORRAR TODO (DELETE GENERAL)
    app.delete(BASE_URL_API + '/daily-global-stock-market-indicators', (req, res) => {
        db.remove({}, { multi: true }, (err) => { // El 'multi: true' le dice a NeDB que borre TODO, no solo uno.
            if (err) return res.status(500).json({ message: "Internal Server Error" });
            res.sendStatus(204); // 204: No Content (Todo ha ido bien, pero no tengo nada que devolverte).
        });
    });

    // BÚSQUEDA ESPECÍFICA POR URL (GET de un recurso concreto)
    app.get(BASE_URL_API + '/daily-global-stock-market-indicators/:region/:index_name', (req, res) => {
        const { region, index_name } = req.params; // Extraemos las variables de la propia URL.
        db.find({ region, index_name }, (err, docs) => { // Buscamos ese registro exacto.
            if (err) return res.status(500).json({ message: "Internal Server Error" });
            if (docs.length > 0) {
                res.status(200).json(limpiarId(docs[0])); // Si hay resultados, mandamos el primero (solo debería haber uno).
            } else {
                res.status(404).json({ message: "Not Found" }); // 404: No encontrado.
            }
        });
    });

    // ERROR DE MÉTODO: No se puede hacer POST a un recurso que ya está especificado en la URL.
    app.post(BASE_URL_API + '/daily-global-stock-market-indicators/:region/:index_name', (req, res) => {
        res.status(405).json({ message: "Method Not Allowed" });
    });

    // ACTUALIZAR UN REGISTRO (PUT)
    app.put(BASE_URL_API + '/daily-global-stock-market-indicators/:region/:index_name', (req, res) => {
        const { region, index_name } = req.params; // Lo que viene en la URL.
        const updatedData = req.body; // Los nuevos datos que manda el usuario.

        // Validamos la estructura.
        if (!validarEstructura(updatedData)) {
            return res.status(400).json({ message: "Bad Request: La estructura del JSON no es correcta" });
        }
        // Seguridad: Evitamos que cambien la región o el nombre en el body contradiciendo la URL.
        if (updatedData.region !== region || updatedData.index_name !== index_name) {
            return res.status(400).json({ message: "Bad Request: Los IDs del body no coinciden con la URL" });
        }
        
        // Actualizamos en la BD: Buscamos por región e índice, y machacamos con $set los nuevos datos.
        db.update({ region, index_name }, { $set: updatedData }, {}, (err, numReplaced) => {
            if (err) return res.status(500).json({ message: "Internal Server Error" });
            if (numReplaced === 0) { // Si se han actualizado 0 documentos, es que no existía.
                return res.status(404).json({ message: "Not Found" });
            }
            // Si salió bien, lo buscamos para devolvérselo actualizado al usuario.
            db.find({ region, index_name }, (err, docs) => {
                if (err) return res.status(500).json({ message: "Internal Server Error" });
                res.status(200).json(limpiarId(docs[0])); // 200: Todo OK.
            });
        });
    });

    // BORRAR UN REGISTRO CONCRETO (DELETE ESPECÍFICO)
    app.delete(BASE_URL_API + '/daily-global-stock-market-indicators/:region/:index_name', (req, res) => {
        const { region, index_name } = req.params; // Variables de la URL.
        db.remove({ region, index_name }, {}, (err, numRemoved) => { // Borramos el que coincida.
            if (err) return res.status(500).json({ message: "Internal Server Error" });
            if (numRemoved === 0) { // Si borramos 0, es que no estaba.
                return res.status(404).json({ message: "Not Found" });
            }
            res.sendStatus(204); // 204: Borrado con éxito (No Content).
        });
    });

    // =====================================================================
    // 4. PROXYS PARA APIS EXTERNAS (Para evitar el error CORS de Frontend)
    // =====================================================================
    
    // GITHUB
    app.get(BASE_URL_API + '/integrations/github', async (req, res) => { // "async" porque usaremos "await" para esperar a Github.
        try {
            console.log("Iniciando petición al proxy de GitHub...");
            const token = process.env.GITHUB_TOKEN_EMILIO; // Token secreto guardado en el servidor.

            if (!token) { // Control de errores por si se nos olvida poner el token.
                console.error("❌ Faltan credenciales: No se encontró GITHUB_TOKEN_EMILIO en el .env");
                return res.status(500).json({ message: "Falta GITHUB_TOKEN_EMILIO en .env" });
            }

            const repos = ['facebook/react', 'vuejs/vue', 'angular/angular', 'sveltejs/svelte', 'nodejs/node']; // Lista de repos.
            const results = []; // Array para guardar lo que nos interese.

            for (const repo of repos) { // Bucle para pedir la info repo por repo.
                // AWAIT: Nos esperamos a que Github conteste para este repo en concreto.
                const response = await fetch(`https://api.github.com/repos/${repo}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + token, // Nos identificamos.
                        'Accept': 'application/vnd.github+json',
                        'User-Agent': 'SOS2526-23-App-Emilio' // Github exige que le digamos el nombre de la app.
                    }
                });

                if (!response.ok) { // Si Github nos dice que no (ej: límite de peticiones superado).
                    const errorText = await response.text();
                    console.error(`❌ Error de GitHub en el repo ${repo}: Código ${response.status} - ${errorText}`);
                    throw new Error(`GitHub respondió con estado ${response.status} para el repo ${repo}`); // Forzamos el salto al Catch.
                }

                const data = await response.json(); // Transformamos la respuesta de Github a JSON.
                
                // Extraemos solo lo útil para nuestra gráfica.
                results.push({
                    name: data.name,
                    stars: data.stargazers_count,
                    forks: data.forks_count,
                    issues: data.open_issues_count,
                    language: data.language
                });
            }

            res.status(200).json(results); // Enviamos el array limpio a nuestro Frontend.

        } catch (error) { // Si cualquier cosa explota arriba, aterriza aquí.
            console.error('💥 ERROR FATAL EN PROXY GITHUB:', error);
            res.status(500).json({ message: "Error en proxy GitHub", error: error.message });
        }
    });

    // TWITCH (FLUJO ASÍNCRONO COMPLEJO)
    app.get(BASE_URL_API + '/proxy/twitch', async (req, res) => {
        
        //[TWITCH - PASO 1]: Frontend pide datos de Twitch. Entramos al proxy.");
        
        try {
            const clientId = process.env.TWITCH_CLIENT_ID_EMILIO; // Usuario de Twitch App.
            const clientSecret = process.env.TWITCH_CLIENT_SECRET_EMILIO; // Contraseña de Twitch App.

            if (!clientId || !clientSecret) { // Si faltan, error 500.
                console.error("❌ Faltan variables de entorno de Twitch");
                return res.status(500).json({ message: "Faltan variables en el .env" });
            }

            //[TWITCH - PASO 2]: Credenciales correctas. Pedimos la llave (Token) a Twitch.");

            // PASO 1: AWAIT. El servidor "pausa" esta función mientras hace el login en Twitch.
            const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ // Twitch requiere que los datos vayan codificados como si fueran parámetros de URL.
                    client_id: clientId,
                    client_secret: clientSecret,
                    grant_type: 'client_credentials'
                })
            });
            const tokenData = await tokenResponse.json(); // Convertimos la respuesta a JSON.
            const accessToken = tokenData.access_token; // Extraemos la llave mágica.

            if (!accessToken) { // Si Twitch no nos da la llave, devolvemos error 502 (Bad Gateway, problema del servidor externo).
                console.error("❌ Twitch no devolvió access_token:", JSON.stringify(tokenData));
                return res.status(502).json({ message: "No se pudo obtener el Access Token", twitchResponse: tokenData });
            }

            //[TWITCH - PASO 3]: ¡Llave conseguida! Ahora pedimos la lista de los juegos Top.");

            // PASO 2: AWAIT. Con la llave en la mano, le pedimos los 5 juegos más vistos.
            const twitchDataResponse = await fetch('https://api.twitch.tv/helix/games/top?first=5', {
                method: 'GET',
                headers: {
                    'Client-ID': clientId, // Usuario.
                    'Authorization': `Bearer ${accessToken}` // Llave obtenida en el paso 1.
                }
            });
            const twitchData = await twitchDataResponse.json(); // Lo pasamos a JSON.

            if (!twitchData.data) { // Verificamos que la estructura sea la esperada.
                console.error("❌ Twitch no devolvió .data:", JSON.stringify(twitchData));
                return res.status(502).json({ message: "Twitch no devolvió datos válidos", twitchResponse: twitchData });
            }

            //[TWITCH - PASO 4]: Juegos recibidos de Twitch. Los empaquetamos.");

            res.status(200).json(twitchData.data); // Le enviamos la lista (data) al Frontend.

            //[TWITCH - PASO 5]: Respuesta enviada a nuestro Frontend. Fin del proceso.");

        } catch (error) { // Si hay problemas de red, saltará aquí.
            console.error("❌ Error en el proxy de Twitch:", error);
            res.status(500).json({ message: "Error conectando con Twitch", error: error.message });
        }
    });
    
    // DUMMYJSON (Tienda online de prueba)
    app.get(BASE_URL_API + '/proxy/store', async (req, res) => {
        try {
            // AWAIT: Petición sencilla a una API abierta (sin tokens).
            const storeResponse = await fetch('https://dummyjson.com/products?limit=5', {
                method: 'GET'
            });

            if (!storeResponse.ok) { // Si falla, forzamos error.
                throw new Error("Fallo al obtener datos de la tienda");
            }

            const storeData = await storeResponse.json(); // Pasamos a JSON.
            res.status(200).json(storeData); // Enviamos al Frontend.

        } catch (error) {
            console.error("❌ Error en el proxy de DummyJSON:", error);
            res.status(500).json({ message: "Error conectando con la tienda", error: error.message });
        }
    });

    // API COMPAÑERO 1 (Soporte SIDA)
    app.get(BASE_URL_API + '/proxy/sos-aids', async (req, res) => {
        try {
            // AWAIT: Le pedimos los datos directamente al backend desplegado del compañero en Render.
            const externalResponse = await fetch('https://soporte-sos.onrender.com/api/v1/aids-deaths-stats');
            
            if (!externalResponse.ok) {
                throw new Error("Fallo al obtener datos del compañero de SOS");
            }

            const data = await externalResponse.json(); // Convertimos.
            res.status(200).json(data); // Devolvemos los datos del compañero a nuestro Frontend.

        } catch (error) { // Muy útil por si el Render del compañero se apaga por inactividad.
            console.error("❌ Error en el proxy de SOS Aids:", error);
            res.status(500).json({ message: "Error conectando con la API del compañero", error: error.message });
        }
    });

    // API COMPAÑERO 2 (Cultura y Ocio)
    app.get(BASE_URL_API + '/proxy/recreation-culture', async (req, res) => {
        try {
            // AWAIT: Hacemos lo mismo con el segundo compañero.
            const externalResponse = await fetch('https://sos2526-24.onrender.com/api/v2/recreation-culture-expenditure');
            
            if (!externalResponse.ok) {
                throw new Error(`Error HTTP ${externalResponse.status}`);
            }
            
            const data = await externalResponse.json();
            res.status(200).json(data);
        } catch (error) {
            console.error('❌ Error en proxy recreation-culture:', error);
            res.status(500).json({ message: "Error conectando con API G24", error: error.message });
        }
    });
}