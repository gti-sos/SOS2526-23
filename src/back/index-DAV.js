import dataStore from "nedb";

const BASE_URL_API = "/api/v1";
const BASE_URL_API_V2 = "/api/v2";

const DOC_URL = "https://documenter.getpostman.com/view/52707486/2sBXigLYQP";

// Inicializamos las dos bases de datos en memoria
const dbV1 = new dataStore();
const dbV2 = new dataStore();

export function loadBackEndDAV(app) {

       // GET /DOCS
    app.get(BASE_URL_API + "/global-ads-performance/docs", (req, res) => {
        res.redirect(DOC_URL);

    });



    // 1. CARGA DE DATOS INICIALES (loadInitialData)
    app.get(BASE_URL_API + "/global-ads-performance/loadInitialData", (req, res) => {
        dbV1.find({}, (err, docs) => {
            if (docs.length === 0) {
                // Aquí metemos el array exacto para que NeDB lo inserte
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
                
                dbV1.insert(newData, (err, newDocs) => {
                    res.status(201).json(newDocs); // 201 Created
                });
            } else {
                res.status(409).json({ message: "Ya existen datos" }); // 409 Conflict
            }
        });
    });

// 2. GET COLECCIÓN COMPLETA (Con Búsquedas y Paginación - Requisitos 3 y 4)
    app.get(BASE_URL_API + "/global-ads-performance", (req, res) => {
        
        const searchQuery = {};

        // --- LÓGICA DE BÚSQUEDAS (Requisito 3) ---
        if (req.query.region) searchQuery.region = req.query.region;
        if (req.query.date) searchQuery.date = req.query.date;
        if (req.query.platform) searchQuery.platform = req.query.platform;
        if (req.query.industry) searchQuery.industry = req.query.industry;
        
        if (req.query.impression) searchQuery.impression = parseInt(req.query.impression);
        if (req.query.click) searchQuery.click = parseInt(req.query.click);
        if (req.query.ad_spend) searchQuery.ad_spend = parseFloat(req.query.ad_spend);
        if (req.query.conversion) searchQuery.conversion = parseInt(req.query.conversion);
        if (req.query.revenue) searchQuery.revenue = parseFloat(req.query.revenue);

        // Preparamos la consulta a la base de datos (SIN el callback todavía)
        let dbQuery = dbV1.find(searchQuery);

        
        // --- LÓGICA DE PAGINACIÓN (Requisito 4) ---
        // Si el usuario envía "?limit=X", limitamos los resultados
        if (req.query.limit) {
            const limit = parseInt(req.query.limit);
            if (!isNaN(limit) && limit >= 0) {
                dbQuery = dbQuery.limit(limit);
            }
        }

        // Si el usuario envía "?offset=X", nos saltamos X resultados
        if (req.query.offset) {
            const offset = parseInt(req.query.offset);
            if (!isNaN(offset) && offset >= 0) {
                dbQuery = dbQuery.skip(offset); // En NeDB el offset se aplica con .skip()
            }
        }

        // --- EJECUCIÓN DE LA CONSULTA ---
        dbQuery.exec((err, data) => {
            if (err) return res.sendStatus(500);
            
            // Eliminamos el _id de NeDB para el Requisito 11
            const cleanData = data.map(resource => {
                delete resource._id;
                return resource;
            });
            
            res.status(200).json(cleanData);
        });
    });

    // 3. POST A LA COLECCIÓN (Añadir recurso)
    app.post(BASE_URL_API + "/global-ads-performance", (req, res) => {
        const newResource = req.body;
        
        // Validación de estructura básica: debe tener todos los campos
        if (!newResource.region || !newResource.date || !newResource.platform || !newResource.industry) {
            return res.sendStatus(400); // 400 Bad Request
        }

        // Comprobamos si ya existe la clave primaria correcta (region + date)
        dbV1.find({ region: newResource.region, date: newResource.date }, (err, docs) => {
            if (docs.length > 0) {
                return res.sendStatus(409); // 409 Conflict (Ya existe)
            }
            dbV1.insert(newResource, (err, newDoc) => {
                res.sendStatus(201); // 201 Created
            });
        });
    });


    // 4. DELETE COLECCIÓN COMPLETA
    app.delete(BASE_URL_API + "/global-ads-performance", (req, res) => {
        // {} borra todos los documentos, {multi: true} permite borrar más de uno a la vez
        dbV1.remove({}, { multi: true }, (err, numRemoved) => {
            res.sendStatus(200); // 200 OK
        });
    });

    // 5. GET RECURSO ESPECÍFICO (region + date)
    app.get(BASE_URL_API + '/global-ads-performance/:region/:date', (req, res) => {
        const { region, date } = req.params;

        dbV1.find({ region, date }, (err, docs) => {
            if (err) return res.status(500).json({ message: "Internal Server Error" });

            if (docs.length > 0) {
                res.status(200).json((docs[0])); // Devuelve UN OBJETO
            } else {
                res.status(404).json({ message: "Not Found" });
            }
        });
    });

    // 6. DELETE RECURSO ESPECÍFICO
    app.delete(BASE_URL_API + "/global-ads-performance/:region/:date", (req, res) => {
        const { region, date } = req.params;

        dbV1.remove({ region: region, date: date }, {}, (err, numRemoved) => {
            if (numRemoved === 0) {
                return res.sendStatus(404); // 404 Not Found si no existía
            }
            res.sendStatus(200); // 200 OK
        });
    });

    // 7. PUT RECURSO ESPECÍFICO (Actualizar)
    app.put(BASE_URL_API + "/global-ads-performance/:region/:date", (req, res) => {
        const { region, date } = req.params;
        const updatedResource = req.body;

        // Comprobar que el ID de la URL coincide con el ID del body (Requisito F06 de errores básicos)
        if (region !== updatedResource.region || date !== updatedResource.date) {
            return res.sendStatus(400); // 400 Bad Request
        }

        dbV1.update({ region: region, date: date }, updatedResource, {}, (err, numReplaced) => {
            if (numReplaced === 0) {
                return res.sendStatus(404); // 404 Not Found si no existe el que queremos actualizar
            }
            res.sendStatus(200); // 200 OK
        });
    });
    

    // MÉTODOS PROHIBIDOS (Tabla Azul L05)
    app.post(BASE_URL_API + "/global-ads-performance/:region/:date", (req, res) => {
        res.sendStatus(405); // Method Not Allowed
    });
    
    app.put(BASE_URL_API + "/global-ads-performance", (req, res) => {
        res.sendStatus(405); // Method Not Allowed
    });


}


/*
--------------------------------------------------------------------------------

VERSION 2

--------------------------------------------------------------------------------
*/

    // 1. CARGA DE DATOS INICIALES (loadInitialData)
    app.get(BASE_URL_API_V2 + "/global-ads-performance/loadInitialData", (req, res) => {
        dbV2.find({}, (err, docs) => {
            if (docs.length === 0) {
                // Aquí metemos el array exacto para que NeDB lo inserte
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
                { region: "Asia", date: "2024-04-22", platform: "Meta Ads", industry: "E-commerce", impression: 98264, click: 3144, ad_spend: 4904.64, conversion: 129, revenue: 23127.27 },
                { region: "North America", date: "2024-09-11", platform: "Meta Ads", industry: "Fintech", impression: 173229, click: 5092, ad_spend: 8758.24, conversion: 65, revenue: 12320.17 },
                { region: "North America", date: "2024-05-26", platform: "Meta Ads", industry: "SaaS", impression: 147483, click: 2138, ad_spend: 1218.66, conversion: 159, revenue: 42434.18 },
                { region: "North America", date: "2024-02-29", platform: "Google Ads", industry: "SaaS", impression: 116472, click: 4006, ad_spend: 10736.08, conversion: 291, revenue: 78428.38 },
                { region: "North America", date: "2024-04-22", platform: "TikTok Ads", industry: "EdTech", impression: 37711, click: 2111, ad_spend: 1435.48, conversion: 92, revenue: 13898.86 },
                { region: "Europe", date: "2024-10-15", platform: "TikTok Ads", industry: "E-commerce", impression: 96412, click: 7047, ad_spend: 7822.17, conversion: 194, revenue: 36717.43 },
                { region: "North America", date: "2024-08-13", platform: "TikTok Ads", industry: "Fintech", impression: 184476, click: 8854, ad_spend: 3098.90, conversion: 198, revenue: 56216.92 },
                { region: "Europe", date: "2024-08-20", platform: "TikTok Ads", industry: "Fintech", impression: 38828, click: 3607, ad_spend: 3498.79, conversion: 116, revenue: 8788.51 },
                { region: "North America", date: "2024-12-25", platform: "Meta Ads", industry: "SaaS", impression: 187957, click: 4586, ad_spend: 9630.60, conversion: 271, revenue: 34433.97 },
                { region: "North America", date: "2024-11-01", platform: "Google Ads", industry: "SaaS", impression: 34592, click: 1615, ad_spend: 1857.25, conversion: 116, revenue: 4344.96 },
                { region: "North America", date: "2024-07-04", platform: "Meta Ads", industry: "Fintech", impression: 185798, click: 5889, ad_spend: 5300.10, conversion: 400, revenue: 41326.63 },
                { region: "Asia", date: "2024-12-30", platform: "TikTok Ads", industry: "EdTech", impression: 194407, click: 13122, ad_spend: 11153.70, conversion: 379, revenue: 56289.95 },
                { region: "Asia", date: "2024-11-13", platform: "Meta Ads", industry: "SaaS", impression: 188062, click: 8143, ad_spend: 14657.40, conversion: 614, revenue: 124232.50 },
                { region: "Asia", date: "2024-12-14", platform: "Meta Ads", industry: "Healthcare", impression: 195710, click: 4481, ad_spend: 2374.93, conversion: 352, revenue: 27223.39 },
                { region: "Oceania", date: "2024-04-09", platform: "Google Ads", industry: "Healthcare", impression: 198824, click: 9046, ad_spend: 32656.06, conversion: 407, revenue: 71482.19 },
                { region: "North America", date: "2024-06-08", platform: "Meta Ads", industry: "SaaS", impression: 196962, click: 5081, ad_spend: 10466.86, conversion: 282, revenue: 24196.95 },
                { region: "Asia", date: "2024-08-29", platform: "Google Ads", industry: "SaaS", impression: 105386, click: 3783, ad_spend: 6885.06, conversion: 130, revenue: 36776.35 },
                { region: "Asia", date: "2024-09-05", platform: "Google Ads", industry: "Healthcare", impression: 49425, click: 1996, ad_spend: 2534.92, conversion: 98, revenue: 9253.27 },
                { region: "North America", date: "2024-12-26", platform: "Meta Ads", industry: "E-commerce", impression: 191141, click: 4453, ad_spend: 5477.19, conversion: 72, revenue: 8367.46 },
                { region: "North America", date: "2024-05-23", platform: "TikTok Ads", industry: "EdTech", impression: 91900, click: 4696, ad_spend: 2488.88, conversion: 367, revenue: 109696.83 },
                { region: "North America", date: "2024-11-26", platform: "Meta Ads", industry: "Healthcare", impression: 11801, click: 795, ad_spend: 2361.15, conversion: 57, revenue: 3966.25 },
                { region: "Asia", date: "2024-11-16", platform: "Meta Ads", industry: "Fintech", impression: 193926, click: 5837, ad_spend: 5837.00, conversion: 193, revenue: 28429.29 },
                { region: "Asia", date: "2024-02-27", platform: "Google Ads", industry: "EdTech", impression: 35355, click: 961, ad_spend: 2133.42, conversion: 68, revenue: 6145.22 },
                { region: "Asia", date: "2024-11-12", platform: "TikTok Ads", industry: "Healthcare", impression: 133148, click: 9120, ad_spend: 4560.00, conversion: 279, revenue: 83385.98 },
                { region: "North America", date: "2024-01-12", platform: "Meta Ads", industry: "E-commerce", impression: 104657, click: 4029, ad_spend: 2860.59, conversion: 204, revenue: 10401.62 },
                { region: "Asia", date: "2024-05-24", platform: "TikTok Ads", industry: "Fintech", impression: 174160, click: 9683, ad_spend: 17816.72, conversion: 512, revenue: 73177.92 },
                { region: "Asia", date: "2024-01-05", platform: "TikTok Ads", industry: "Fintech", impression: 6015, click: 410, ad_spend: 791.30, conversion: 28, revenue: 4383.32 },
                { region: "Oceania", date: "2024-01-06", platform: "Meta Ads", industry: "Healthcare", impression: 17763, click: 726, ad_spend: 1408.44, conversion: 30, revenue: 1946.19 },
                { region: "Asia", date: "2024-10-14", platform: "TikTok Ads", industry: "EdTech", impression: 97193, click: 6230, ad_spend: 9968.00, conversion: 306, revenue: 81609.12 },
                { region: "Asia", date: "2024-03-06", platform: "Meta Ads", industry: "Healthcare", impression: 58682, click: 1748, ad_spend: 2604.52, conversion: 84, revenue: 12746.65 },
                { region: "North America", date: "2024-03-21", platform: "TikTok Ads", industry: "SaaS", impression: 108196, click: 5334, ad_spend: 5280.66, conversion: 289, revenue: 27408.56 },
                { region: "Asia", date: "2024-01-08", platform: "Google Ads", industry: "Fintech", impression: 63243, click: 1707, ad_spend: 3823.68, conversion: 37, revenue: 3893.12 },
                { region: "Asia", date: "2024-08-20", platform: "Google Ads", industry: "E-commerce", impression: 152979, click: 4650, ad_spend: 3673.50, conversion: 330, revenue: 91949.73 },
                { region: "North America", date: "2024-01-08", platform: "Google Ads", industry: "EdTech", impression: 132600, click: 6802, ad_spend: 10407.06, conversion: 97, revenue: 6779.29 },
                { region: "Oceania", date: "2024-09-30", platform: "Google Ads", industry: "Fintech", impression: 110977, click: 4150, ad_spend: 4689.50, conversion: 197, revenue: 18314.78 },
                { region: "Europe", date: "2024-03-07", platform: "Google Ads", industry: "EdTech", impression: 87152, click: 3599, ad_spend: 9465.37, conversion: 127, revenue: 25958.50 },
                { region: "Asia", date: "2024-08-16", platform: "Meta Ads", industry: "Fintech", impression: 164096, click: 1919, ad_spend: 1266.54, conversion: 139, revenue: 7181.17 },
                { region: "Europe", date: "2024-08-10", platform: "Meta Ads", industry: "Healthcare", impression: 21389, click: 941, ad_spend: 752.80, conversion: 46, revenue: 8479.43 },
                { region: "Asia", date: "2024-04-27", platform: "Google Ads", industry: "Healthcare", impression: 69323, click: 2169, ad_spend: 4750.11, conversion: 94, revenue: 16337.12 },
                { region: "Asia", date: "2024-05-17", platform: "Google Ads", industry: "SaaS", impression: 138291, click: 3318, ad_spend: 2753.94, conversion: 217, revenue: 12761.51 },
                { region: "Europe", date: "2024-11-29", platform: "TikTok Ads", industry: "EdTech", impression: 72444, click: 2339, ad_spend: 3251.21, conversion: 153, revenue: 12919.22 },
                { region: "Asia", date: "2024-12-04", platform: "Google Ads", industry: "Healthcare", impression: 160002, click: 7520, ad_spend: 22259.20, conversion: 403, revenue: 70823.58 },
                { region: "North America", date: "2024-08-12", platform: "Meta Ads", industry: "E-commerce", impression: 16246, click: 448, ad_spend: 891.52, conversion: 8, revenue: 1955.09 },
                { region: "Europe", date: "2024-06-05", platform: "Meta Ads", industry: "Fintech", impression: 15789, click: 423, ad_spend: 765.63, conversion: 7, revenue: 1223.95 },
                { region: "Oceania", date: "2024-06-05", platform: "Google Ads", industry: "EdTech", impression: 25103, click: 710, ad_spend: 1661.40, conversion: 24, revenue: 1896.75 },
                { region: "Asia", date: "2024-12-28", platform: "TikTok Ads", industry: "SaaS", impression: 138515, click: 4377, ad_spend: 2232.27, conversion: 285, revenue: 10321.59 },
                { region: "Oceania", date: "2024-02-20", platform: "Meta Ads", industry: "EdTech", impression: 180399, click: 6025, ad_spend: 4217.50, conversion: 191, revenue: 17456.79 },
                { region: "Asia", date: "2024-05-16", platform: "Meta Ads", industry: "E-commerce", impression: 62545, click: 606, ad_spend: 1187.76, conversion: 37, revenue: 5627.66 },
                { region: "North America", date: "2024-06-30", platform: "Google Ads", industry: "Fintech", impression: 72526, click: 2146, ad_spend: 3347.76, conversion: 168, revenue: 25859.74 },
                { region: "Oceania", date: "2024-07-07", platform: "Meta Ads", industry: "EdTech", impression: 67823, click: 2075, ad_spend: 3797.25, conversion: 26, revenue: 4093.91 },
                { region: "Asia", date: "2024-06-23", platform: "Meta Ads", industry: "E-commerce", impression: 164937, click: 4453, ad_spend: 4809.24, conversion: 129, revenue: 35127.50 },
                { region: "Europe", date: "2024-12-14", platform: "Meta Ads", industry: "EdTech", impression: 114575, click: 2039, ad_spend: 1080.67, conversion: 113, revenue: 10656.96 },
                { region: "Europe", date: "2024-06-13", platform: "Google Ads", industry: "Fintech", impression: 132157, click: 2999, ad_spend: 2789.07, conversion: 152, revenue: 21855.26 },
                { region: "Europe", date: "2024-01-11", platform: "TikTok Ads", industry: "Healthcare", impression: 108145, click: 3882, ad_spend: 3649.08, conversion: 98, revenue: 28726.52 },
                { region: "Asia", date: "2024-04-29", platform: "TikTok Ads", industry: "SaaS", impression: 72642, click: 3014, ad_spend: 3496.24, conversion: 59, revenue: 15070.44 },
                { region: "Asia", date: "2024-04-07", platform: "TikTok Ads", industry: "Healthcare", impression: 131678, click: 8374, ad_spend: 7620.34, conversion: 505, revenue: 29682.01 },
                { region: "Oceania", date: "2024-05-13", platform: "Google Ads", industry: "E-commerce", impression: 34402, click: 1314, ad_spend: 4323.06, conversion: 17, revenue: 1273.24 },
                { region: "Europe", date: "2024-10-08", platform: "Meta Ads", industry: "Healthcare", impression: 58276, click: 1183, ad_spend: 1762.67, conversion: 89, revenue: 20273.71 },
                { region: "North America", date: "2024-08-14", platform: "Google Ads", industry: "EdTech", impression: 168059, click: 3462, ad_spend: 10662.96, conversion: 154, revenue: 33243.77 },
                { region: "North America", date: "2024-08-16", platform: "Meta Ads", industry: "Fintech", impression: 91123, click: 1567, ad_spend: 3651.11, conversion: 64, revenue: 5119.10 },
                { region: "Oceania", date: "2024-05-28", platform: "Meta Ads", industry: "Fintech", impression: 16344, click: 452, ad_spend: 406.80, conversion: 5, revenue: 1102.53 },
                { region: "Asia", date: "2024-03-26", platform: "TikTok Ads", industry: "SaaS", impression: 99457, click: 5808, ad_spend: 9292.80, conversion: 80, revenue: 12231.10 },
                { region: "Asia", date: "2024-06-07", platform: "Meta Ads", industry: "E-commerce", impression: 57375, click: 843, ad_spend: 1357.23, conversion: 40, revenue: 9739.81 },
                { region: "Asia", date: "2024-04-17", platform: "Google Ads", industry: "E-commerce", impression: 115017, click: 2771, ad_spend: 7093.76, conversion: 95, revenue: 22528.38 },
                { region: "North America", date: "2024-09-28", platform: "Meta Ads", industry: "EdTech", impression: 90431, click: 1853, ad_spend: 3150.10, conversion: 57, revenue: 14834.93 },
                { region: "North America", date: "2024-03-13", platform: "Meta Ads", industry: "E-commerce", impression: 140566, click: 5046, ad_spend: 3128.52, conversion: 384, revenue: 59980.19 },
                { region: "Europe", date: "2024-02-28", platform: "Meta Ads", industry: "EdTech", impression: 133583, click: 3954, ad_spend: 2570.10, conversion: 255, revenue: 31756.12 },
                { region: "North America", date: "2024-04-08", platform: "Google Ads", industry: "E-commerce", impression: 198555, click: 13104, ad_spend: 32235.84, conversion: 336, revenue: 58794.32 },
                { region: "Europe", date: "2024-09-23", platform: "Meta Ads", industry: "Healthcare", impression: 88560, click: 1319, ad_spend: 685.88, conversion: 81, revenue: 8584.02 },
                { region: "Asia", date: "2024-06-24", platform: "Google Ads", industry: "Fintech", impression: 117217, click: 5602, ad_spend: 19550.98, conversion: 411, revenue: 75729.26 },
                { region: "Asia", date: "2024-08-24", platform: "Meta Ads", industry: "Fintech", impression: 104616, click: 4048, ad_spend: 7164.96, conversion: 233, revenue: 45906.84 },
                { region: "North America", date: "2024-02-14", platform: "TikTok Ads", industry: "Healthcare", impression: 79553, click: 2712, ad_spend: 840.72, conversion: 170, revenue: 16973.79 },
                { region: "North America", date: "2024-08-20", platform: "Google Ads", industry: "Fintech", impression: 170904, click: 4751, ad_spend: 5321.12, conversion: 326, revenue: 44297.15 },
                { region: "Asia", date: "2024-07-14", platform: "Google Ads", industry: "Healthcare", impression: 88807, click: 4999, ad_spend: 11847.63, conversion: 348, revenue: 103474.34 },
                { region: "North America", date: "2024-08-14", platform: "Meta Ads", industry: "EdTech", impression: 157499, click: 1574, ad_spend: 2770.24, conversion: 45, revenue: 13465.06 },
                { region: "Oceania", date: "2024-09-27", platform: "Meta Ads", industry: "E-commerce", impression: 46846, click: 983, ad_spend: 707.76, conversion: 11, revenue: 2501.87 },
                { region: "Europe", date: "2024-09-18", platform: "TikTok Ads", industry: "Fintech", impression: 104986, click: 6131, ad_spend: 2207.16, conversion: 219, revenue: 57679.50 },
                { region: "Asia", date: "2024-05-24", platform: "Meta Ads", industry: "EdTech", impression: 172516, click: 6314, ad_spend: 4546.08, conversion: 335, revenue: 82096.80 },
                { region: "Asia", date: "2024-08-23", platform: "Meta Ads", industry: "E-commerce", impression: 187099, click: 2469, ad_spend: 2049.27, conversion: 103, revenue: 3413.17 },
                { region: "Asia", date: "2024-04-04", platform: "Google Ads", industry: "SaaS", impression: 111661, click: 3930, ad_spend: 3301.20, conversion: 310, revenue: 21226.88 },
                { region: "Europe", date: "2024-06-09", platform: "Meta Ads", industry: "EdTech", impression: 79441, click: 3082, ad_spend: 1633.46, conversion: 100, revenue: 29391.59 },
                { region: "Oceania", date: "2024-04-15", platform: "Google Ads", industry: "SaaS", impression: 14078, click: 763, ad_spend: 1724.38, conversion: 57, revenue: 16289.72 },
                { region: "Oceania", date: "2024-01-07", platform: "Meta Ads", industry: "Fintech", impression: 182235, click: 5047, ad_spend: 3734.78, conversion: 260, revenue: 53450.65 },
                { region: "North America", date: "2024-02-24", platform: "Meta Ads", industry: "SaaS", impression: 128629, click: 2109, ad_spend: 2720.61, conversion: 168, revenue: 49256.62 },
                { region: "North America", date: "2024-04-02", platform: "Meta Ads", industry: "Fintech", impression: 21309, click: 432, ad_spend: 717.12, conversion: 15, revenue: 4449.98 },
                { region: "North America", date: "2024-09-06", platform: "Google Ads", industry: "Fintech", impression: 167932, click: 6717, ad_spend: 16523.82, conversion: 247, revenue: 38475.06 },
                { region: "Europe", date: "2024-01-08", platform: "TikTok Ads", industry: "Fintech", impression: 162795, click: 8107, ad_spend: 7782.72, conversion: 575, revenue: 86383.64 },
                { region: "Europe", date: "2024-08-18", platform: "Meta Ads", industry: "EdTech", impression: 50893, click: 1124, ad_spend: 1584.84, conversion: 29, revenue: 2707.50 },
                { region: "Asia", date: "2024-09-22", platform: "TikTok Ads", industry: "SaaS", impression: 81619, click: 3623, ad_spend: 1702.81, conversion: 222, revenue: 46448.44 }
            ];
                
                dbV2.insert(newData, (err, newDocs) => {
                    res.status(201).json(newDocs); // 201 Created
                });
            } else {
                res.status(409).json({ message: "Ya existen datos" }); // 409 Conflict
            }
        });
    });


// 2. GET COLECCIÓN COMPLETA (Con Búsquedas y Paginación - Requisitos 3 y 4)
    app.get(BASE_URL_API_V2 + "/global-ads-performance", (req, res) => {
        
        const searchQuery = {};

        // --- LÓGICA DE BÚSQUEDAS (Requisito 3) ---
        if (req.query.region) searchQuery.region = req.query.region;
        if (req.query.date) searchQuery.date = req.query.date;
        if (req.query.platform) searchQuery.platform = req.query.platform;
        if (req.query.industry) searchQuery.industry = req.query.industry;
        
        if (req.query.impression) searchQuery.impression = parseInt(req.query.impression);
        if (req.query.click) searchQuery.click = parseInt(req.query.click);
        if (req.query.ad_spend) searchQuery.ad_spend = parseFloat(req.query.ad_spend);
        if (req.query.conversion) searchQuery.conversion = parseInt(req.query.conversion);
        if (req.query.revenue) searchQuery.revenue = parseFloat(req.query.revenue);

        // Preparamos la consulta a la base de datos (SIN el callback todavía)
        let dbQuery = dbV2.find(searchQuery);

        
        // --- LÓGICA DE PAGINACIÓN (Requisito 4) ---
        // Si el usuario envía "?limit=X", limitamos los resultados
        if (req.query.limit) {
            const limit = parseInt(req.query.limit);
            if (!isNaN(limit) && limit >= 0) {
                dbQuery = dbQuery.limit(limit);
            }
        }

        // Si el usuario envía "?offset=X", nos saltamos X resultados
        if (req.query.offset) {
            const offset = parseInt(req.query.offset);
            if (!isNaN(offset) && offset >= 0) {
                dbQuery = dbQuery.skip(offset); // En NeDB el offset se aplica con .skip()
            }
        }

        // --- EJECUCIÓN DE LA CONSULTA ---
        dbQuery.exec((err, data) => {
            if (err) return res.sendStatus(500);
            
            // Eliminamos el _id de NeDB para el Requisito 11
            const cleanData = data.map(resource => {
                delete resource._id;
                return resource;
            });
            
            res.status(200).json(cleanData);
        });
    });

    // 3. POST A LA COLECCIÓN (Añadir recurso)
    app.post(BASE_URL_API_V2 + "/global-ads-performance", (req, res) => {
        const newResource = req.body;
        
        // Validación de estructura básica: debe tener todos los campos
        if (!newResource.region || !newResource.date || !newResource.platform || !newResource.industry) {
            return res.sendStatus(400); // 400 Bad Request
        }

        // Comprobamos si ya existe la clave primaria correcta (region + date)
        dbV2.find({ region: newResource.region, date: newResource.date }, (err, docs) => {
            if (docs.length > 0) {
                return res.sendStatus(409); // 409 Conflict (Ya existe)
            }
            dbV2.insert(newResource, (err, newDoc) => {
                res.sendStatus(201); // 201 Created
            });
        });
    });


    // 4. DELETE COLECCIÓN COMPLETA
    app.delete(BASE_URL_API_V2 + "/global-ads-performance", (req, res) => {
        // {} borra todos los documentos, {multi: true} permite borrar más de uno a la vez
        dbV2.remove({}, { multi: true }, (err, numRemoved) => {
            res.sendStatus(200); // 200 OK
        });
    });

    // 5. GET RECURSO ESPECÍFICO (region + date)
    app.get(BASE_URL_API_V2 + '/global-ads-performance/:region/:date', (req, res) => {
        const { region, date } = req.params;

        dbV2.find({ region, date }, (err, docs) => {
            if (err) return res.status(500).json({ message: "Internal Server Error" });

            if (docs.length > 0) {
                res.status(200).json((docs[0])); // Devuelve UN OBJETO
            } else {
                res.status(404).json({ message: "Not Found" });
            }
        });
    });

    // 6. DELETE RECURSO ESPECÍFICO
    app.delete(BASE_URL_API_V2 + "/global-ads-performance/:region/:date", (req, res) => {
        const { region, date } = req.params;

        dbV2.remove({ region: region, date: date }, {}, (err, numRemoved) => {
            if (numRemoved === 0) {
                return res.sendStatus(404); // 404 Not Found si no existía
            }
            res.sendStatus(200); // 200 OK
        });
    });

    // 7. PUT RECURSO ESPECÍFICO (Actualizar)
    app.put(BASE_URL_API_V2 + "/global-ads-performance/:region/:date", (req, res) => {
        const { region, date } = req.params;
        const updatedResource = req.body;

        // Comprobar que el ID de la URL coincide con el ID del body (Requisito F06 de errores básicos)
        if (region !== updatedResource.region || date !== updatedResource.date) {
            return res.sendStatus(400); // 400 Bad Request
        }

        dbV2.update({ region: region, date: date }, updatedResource, {}, (err, numReplaced) => {
            if (numReplaced === 0) {
                return res.sendStatus(404); // 404 Not Found si no existe el que queremos actualizar
            }
            res.sendStatus(200); // 200 OK
        });
    });
    

    // MÉTODOS PROHIBIDOS (Tabla Azul L05)
    app.post(BASE_URL_API_V2 + "/global-ads-performance/:region/:date", (req, res) => {
        res.sendStatus(405); // Method Not Allowed
    });
    
    app.put(BASE_URL_API_V2 + "/global-ads-performance", (req, res) => {
        res.sendStatus(405); // Method Not Allowed
    });
