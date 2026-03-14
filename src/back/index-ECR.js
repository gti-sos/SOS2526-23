import util from 'util';
util.isDate = function(d) { return d instanceof Date; };
util.isRegExp = function(re) { return re instanceof RegExp; };

import Datastore from 'nedb';

const BASE_URL_API = "/api/v1";

export function loadBackEndECR(app) {
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

    // INICIALIZAMOS LA BASE DE DATOS NeDB
    const db = new Datastore({ filename: './dailyIndicators.db', autoload: true });

    // RUTA DE DOCUMENTACIÓN
    app.get(BASE_URL_API + '/daily-global-stock-market-indicators/docs', (req, res) => {
        res.redirect('https://documenter.getpostman.com/view/52708852/2sBXigLYL8');
    });

    // 1. CARGA DE DATOS INICIALES
    app.get(BASE_URL_API + '/daily-global-stock-market-indicators/loadInitialData', (req, res) => {
    db.find({}, (err, docs) => {
        if (err) {
            console.log("🔴 ERROR EN EL FIND:", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        if (docs.length === 0) {
            // ¿Existe la variable datosIndices? Si no existe, aquí saltará el error.
            db.insert(datosIndices, (err, newDocs) => {
                if (err) {
                    console.log("🔴 ERROR EN EL INSERT:", err);
                    return res.status(500).json({ message: "Internal Server Error" });
                }
                
                // Limpiamos el _id antes de devolver (Requisito F06)
                const docsSinId = newDocs.map(d => {
                    const copy = { ...d };
                    delete copy._id;
                    return copy;
                });
                res.status(201).json(docsSinId);
            });
        } else {
            res.status(409).json({ message: "Conflict: Ya existen datos" });
        }
    });
});

    // =====================================================================
    // METODOS DE LA TABLA AZUL Y CUADRO VERDE
    // =====================================================================

    // --- 1. COLECCIÓN BASE ---

    // GET: Devolver toda la colección (Con Búsquedas y Paginación)
    app.get(BASE_URL_API + '/daily-global-stock-market-indicators', (req, res) => {
        const searchQuery = {};

        // LÓGICA DE BÚSQUEDAS POR TODOS LOS CAMPOS (Requisito F06)
        if (req.query.date) searchQuery.date = req.query.date;
        if (req.query.index_name) searchQuery.index_name = req.query.index_name;
        if (req.query.region) searchQuery.region = req.query.region;
        
        if (req.query.open) searchQuery.open = parseFloat(req.query.open);
        if (req.query.high) searchQuery.high = parseFloat(req.query.high);
        if (req.query.low) searchQuery.low = parseFloat(req.query.low);
        if (req.query.close) searchQuery.close = parseFloat(req.query.close);
        if (req.query.volume) searchQuery.volume = parseInt(req.query.volume);
        if (req.query.daily_change_percent) searchQuery.daily_change_percent = parseFloat(req.query.daily_change_percent);

        let dbQuery = db.find(searchQuery);

        // LÓGICA DE PAGINACIÓN (Requisito F06)
        if (req.query.limit) {
            const limit = parseInt(req.query.limit);
            if (!isNaN(limit) && limit >= 0) dbQuery = dbQuery.limit(limit);
        }

        if (req.query.offset) {
            const offset = parseInt(req.query.offset);
            if (!isNaN(offset) && offset >= 0) dbQuery = dbQuery.skip(offset);
        }

        // Ejecutamos la consulta
        dbQuery.exec((err, docs) => {
            if (err) return res.status(500).json({ message: "Internal Server Error" });
            
            // Eliminamos el _id de NeDB para que el usuario no lo vea
            const cleanData = docs.map(resource => {
                const copy = { ...resource };
                delete copy._id;
                return copy;
            });
            
            res.status(200).json(cleanData); // Siempre devuelve un Array
        });
    });

    // POST: Crear un nuevo recurso
    app.post(BASE_URL_API + '/daily-global-stock-market-indicators', (req, res) => {
        const newData = req.body;
        
        // Validación: Estructura estricta (Requisito F06 - Devolver 400 si faltan campos)
        if (!newData || !newData.date || !newData.index_name || !newData.region || 
            !newData.open || !newData.high || !newData.low || !newData.close || 
            !newData.volume || !newData.daily_change_percent) {
            return res.status(400).json({ message: "Bad Request: Faltan campos requeridos o la estructura es incorrecta" });
        }

        // Si intentan colar un _id, lo borramos
        if (newData._id) {
            delete newData._id;
        }

        // Comprobamos conflicto por ID compuesto (region e index_name)
        db.find({ region: newData.region, index_name: newData.index_name }, (err, docs) => {
            if (err) return res.status(500).json({ message: "Internal Server Error" });
            
            if (docs.length > 0) {
                return res.status(409).json({ message: "Conflict: El recurso ya existe" });
            }

            db.insert(newData, (err, newDoc) => {
                if (err) return res.status(500).json({ message: "Internal Server Error" });
                res.status(201).json({ message: "Created" });
            });
        });
    });

    // PUT: Actualizar toda la colección (NO PERMITIDO)
    app.put(BASE_URL_API + '/daily-global-stock-market-indicators', (req, res) => {
        res.status(405).json({ message: "Method Not Allowed" });
    });

    // DELETE: Borrar toda la colección
    app.delete(BASE_URL_API + '/daily-global-stock-market-indicators', (req, res) => {
        db.remove({}, { multi: true }, (err, numRemoved) => {
            if (err) return res.status(500).json({ message: "Internal Server Error" });
            res.status(200).json({ message: "All data deleted" });
        });
    });

    // --- 2. RECURSO CONCRETO (ID COMPUESTO: /:region/:index_name) ---

    // GET: Devolver un recurso concreto
    app.get(BASE_URL_API + '/daily-global-stock-market-indicators/:region/:index_name', (req, res) => {
        const { region, index_name } = req.params;
        db.find({ region: region, index_name: index_name }, (err, docs) => {
            if (err) return res.status(500).json({ message: "Internal Server Error" });
            
            if (docs.length > 0) {
                const resource = { ...docs[0] };
                delete resource._id; // Ocultamos el _id
                res.status(200).json(resource); // Se devuelve UN OBJETO, no un array (Requisito F06)
            } else {
                res.status(404).json({ message: "Not Found" });
            }
        });
    });

    // POST: Crear un recurso en una URL concreta (NO PERMITIDO)
    app.post(BASE_URL_API + '/daily-global-stock-market-indicators/:region/:index_name', (req, res) => {
        res.status(405).json({ message: "Method Not Allowed" });
    });

    // PUT: Actualizar un recurso concreto
    app.put(BASE_URL_API + '/daily-global-stock-market-indicators/:region/:index_name', (req, res) => {
        const { region, index_name } = req.params;
        const updatedData = req.body;

        // Validación 400: Campos obligatorios y comprobación de que el ID de la URL coincide con el Body
        if (!updatedData || !updatedData.date || !updatedData.index_name || !updatedData.region || 
            !updatedData.open || !updatedData.high || !updatedData.low || !updatedData.close || 
            !updatedData.volume || !updatedData.daily_change_percent) {
            return res.status(400).json({ message: "Bad Request: Faltan campos requeridos" });
        }

        if (updatedData.region !== region || updatedData.index_name !== index_name) {
            return res.status(400).json({ message: "Bad Request: Los IDs del body no coinciden con la URL" });
        }

        if (updatedData._id) {
            delete updatedData._id;
        }

        db.update({ region: region, index_name: index_name }, updatedData, {}, (err, numReplaced) => {
            if (err) return res.status(500).json({ message: "Internal Server Error" });
            
            if (numReplaced > 0) {
                res.status(200).json({ message: "Updated" });
            } else {
                res.status(404).json({ message: "Not Found" });
            }
        });
    });

    // DELETE: Borrar un recurso concreto
    app.delete(BASE_URL_API + '/daily-global-stock-market-indicators/:region/:index_name', (req, res) => {
        const { region, index_name } = req.params;
        
        db.remove({ region: region, index_name: index_name }, {}, (err, numRemoved) => {
            if (err) return res.status(500).json({ message: "Internal Server Error" });

            if (numRemoved > 0) {
                res.status(200).json({ message: "Deleted" });
            } else {
                res.status(404).json({ message: "Not Found" });
            }
        });
    });
}