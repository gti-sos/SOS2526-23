import dataStore from "nedb";

const BASE_URL_API = "/api/v1";
// Inicializamos la base de datos en memoria
const db = new dataStore();

export function loadBackEndDAV(app) {

    // 1. CARGA DE DATOS INICIALES (loadInitialData)
    app.get(BASE_URL_API + "/google-ads-performance/loadInitialData", (req, res) => {
        db.find({}, (err, docs) => {
            if (docs.length === 0) {
                // Aquí metemos tu array exacto para que NeDB lo inserte
                const newData = [
                    { region: "Asia", date: "2024-01-21", platform: "Google Ads", industry: "Fintech", impression: 59886, click: 2113, ad_spend: 2662.38, conversion: 159, revenue: 4803.43 },
                    { region: "Europe", date: "2024-01-22", platform: "TikTok Ads", industry: "EdTech", impression: 135608, click: 5220, ad_spend: 6159.60, conversion: 411, revenue: 64126.68 },
                    { region: "North America", date: "2024-06-15", platform: "TikTok Ads", industry: "Healthcare", impression: 92313, click: 5991, ad_spend: 5092.35, conversion: 267, revenue: 10489.07 },
                    { region: "Europe", date: "2024-01-02", platform: "TikTok Ads", industry: "SaaS", impression: 83953, click: 5935, ad_spend: 7834.20, conversion: 296, revenue: 50505.07 },
                    { region: "Europe", date: "2024-02-22", platform: "TikTok Ads", industry: "Healthcare", impression: 91807, click: 4489, ad_spend: 8663.77, conversion: 107, revenue: 3369.53 },
                    { region: "North America", date: "2024-10-15", platform: "TikTok Ads", industry: "Fintech", impression: 17666, click: 724, ad_spend: 267.88, conversion: 23, revenue: 5220.85 },
                    { region: "North America", date: "2024-08-14", platform: "Meta Ads", industry: "Fintech", impression: 118252, click: 3748, ad_spend: 1574.16, conversion: 152, revenue: 12838.56 },
                    { region: "Asia", date: "2024-04-05", platform: "TikTok Ads", industry: "EdTech", impression: 92939, click: 5176, ad_spend: 3416.16, conversion: 388, revenue: 96298.69 },
                    { region: "Europe", date: "2024-04-17", platform: "Meta Ads", industry: "EdTech", impression: 30939, click: 937, ad_spend: 552.83, conversion: 63, revenue: 16531.03 },
                    { region: "North America", date: "2024-11-13", platform: "Google Ads", industry: "Fintech", impression: 8748, click: 362, ad_spend: 438.02, conversion: 10, revenue: 966.57 },
                    { region: "Asia", date: "2024-04-22", platform: "Meta Ads", industry: "E-commerce", impression: 98264, click: 3144, ad_spend: 4904.64, conversion: 129, revenue: 23127.27 }
                ];
                
                db.insert(newData, (err, newDocs) => {
                    res.status(201).json(newDocs); // 201 Created
                });
            } else {
                res.status(409).json({ message: "Ya existen datos" }); // 409 Conflict
            }
        });
    });

    // 2. GET COLECCIÓN COMPLETA
    app.get(BASE_URL_API + "/google-ads-performance", (req, res) => {
        db.find({}, (err, data) => {
            if (err) return res.sendStatus(500);
            
            // Eliminamos el _id de NeDB para el Requisito 11
            const cleanData = data.map(resource => {
                delete resource._id;
                return resource;
            });
            res.status(200).json(cleanData); // Se devuelve un Array
        });
    });

    // 3. POST A LA COLECCIÓN (Añadir recurso)
    app.post(BASE_URL_API + "/google-ads-performance", (req, res) => {
        const newResource = req.body;
        
        // Validación de estructura básica: debe tener region y date
        if (!newResource.region || !newResource.date || !newResource.platform || !newResource.industry) {
            return res.sendStatus(400); // 400 Bad Request
        }

        // Comprobamos si ya existe la clave primaria (region + date)
        db.find({ region: newResource.region, date: newResource.date }, (err, docs) => {
            if (docs.length > 0) {
                return res.sendStatus(409); // 409 Conflict (Ya existe)
            }
            db.insert(newResource, (err, newDoc) => {
                res.sendStatus(201); // 201 Created
            });
        });
    });

    // 4. DELETE COLECCIÓN COMPLETA
    app.delete(BASE_URL_API + "/google-ads-performance", (req, res) => {
        // {} borra todos los documentos, {multi: true} permite borrar más de uno a la vez
        db.remove({}, { multi: true }, (err, numRemoved) => {
            res.sendStatus(200); // 200 OK
        });
    });

    // 5. GET RECURSO ESPECÍFICO
    app.get(BASE_URL_API + "/google-ads-performance/:region/:date", (req, res) => {
        const { region, date } = req.params;

        db.find({ region: region, date: date }, (err, docs) => {
            if (docs.length === 0) {
                return res.sendStatus(404); // 404 Not Found
            }
            // Borramos el _id y devolvemos UN OBJETO, no un array (Requisito 8b)
            delete docs._id;
            res.status(200).json(docs); 
        });
    });

    // 6. DELETE RECURSO ESPECÍFICO
    app.delete(BASE_URL_API + "/google-ads-performance/:region/:date", (req, res) => {
        const { region, date } = req.params;

        db.remove({ region: region, date: date }, {}, (err, numRemoved) => {
            if (numRemoved === 0) {
                return res.sendStatus(404); // 404 Not Found si no existía
            }
            res.sendStatus(200); // 200 OK
        });
    });

    // 7. PUT RECURSO ESPECÍFICO (Actualizar)
    app.put(BASE_URL_API + "/google-ads-performance/:region/:date", (req, res) => {
        const { region, date } = req.params;
        const updatedResource = req.body;

        // Comprobar que el ID de la URL coincide con el ID del body (Requisito F06 de errores básicos)
        if (region !== updatedResource.region || date !== updatedResource.date) {
            return res.sendStatus(400); // 400 Bad Request
        }

        db.update({ region: region, date: date }, updatedResource, {}, (err, numReplaced) => {
            if (numReplaced === 0) {
                return res.sendStatus(404); // 404 Not Found si no existe el que queremos actualizar
            }
            res.sendStatus(200); // 200 OK
        });
    });

    // MÉTODOS PROHIBIDOS (Tabla Azul L05)
    app.post(BASE_URL_API + "/google-ads-performance/:region/:date", (req, res) => {
        res.sendStatus(405); // Method Not Allowed
    });
    
    app.put(BASE_URL_API + "/google-ads-performance", (req, res) => {
        res.sendStatus(405); // Method Not Allowed
    });
}