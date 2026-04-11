//Importamos las librerías necesarias para autenticación JWT y hashing de contraseñas
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dataStore from "nedb";

// Clave secreta para firmar los tokens (en producción, esto DEBE ir en un archivo .env)
const JWT_SECRET = "mi_super_clave_secreta_para_sos2526"; 

// Inicializamos una nueva base de datos para los usuarios
const usersDb = new dataStore();

const BASE_URL_API = "/api/v1";
const DOC_URL = "https://documenter.getpostman.com/view/52707486/2sBXigLYQP";

// Inicializamos la base de datos en memoria
const db = new dataStore();

// Middleware para verificar el token JWT en las rutas protegidas
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Acceso denegado. Token no proporcionado." });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Token inválido o expirado." });
        req.user = decoded;
        next();
    });
};

export function loadBackEndDAV(app) {

       // GET /DOCS
    app.get(BASE_URL_API + "/global-ads-performance/docs", (req, res) => {
        res.redirect(DOC_URL);

    });


    // 1. CARGA DE DATOS INICIALES (loadInitialData)
    app.get(BASE_URL_API + "/global-ads-performance/loadInitialData", (req, res) => {
        db.find({}, (err, docs) => {
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
                
                db.insert(newData, (err, newDocs) => {
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
        let dbQuery = db.find(searchQuery);

        
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
    app.post(BASE_URL_API + "/global-ads-performance", verifyToken, (req, res) => {
        const newResource = req.body;
        
        // Validación de estructura básica: debe tener todos los campos
        if (!newResource.region || !newResource.date || !newResource.platform || !newResource.industry) {
            return res.sendStatus(400); // 400 Bad Request
        }

        // Comprobamos si ya existe la clave primaria correcta (region + date)
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
    app.delete(BASE_URL_API + "/global-ads-performance", verifyToken, (req, res) => {
        // {} borra todos los documentos, {multi: true} permite borrar más de uno a la vez
        db.remove({}, { multi: true }, (err, numRemoved) => {
            res.sendStatus(200); // 200 OK
        });
    });

    // 5. GET RECURSO ESPECÍFICO (region + date)
    app.get(BASE_URL_API + '/global-ads-performance/:region/:date', (req, res) => {
        const { region, date } = req.params;

        db.find({ region, date }, (err, docs) => {
            if (err) return res.status(500).json({ message: "Internal Server Error" });

            if (docs.length > 0) {
                res.status(200).json((docs[0])); // Devuelve UN OBJETO
            } else {
                res.status(404).json({ message: "Not Found" });
            }
        });
    });

    // RUTAS DE AUTENTICACIÓN (Registro y Login)
    app.post(BASE_URL_API + "/auth/register", async (req, res) => {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Usuario y contraseña son requeridos" });
        }

        // Comprobar si el usuario ya existe
        usersDb.find({ username }, async (err, docs) => {
            if (docs.length > 0) {
                return res.status(409).json({ message: "El usuario ya existe" });
            }

            // Encriptar la contraseña (salteo de 10 rondas)
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = { username, password: hashedPassword };

            usersDb.insert(newUser, (err, newDoc) => {
                res.status(201).json({ message: "Usuario registrado con éxito" });
            });
        });
    });

    // Login: Verificar credenciales y generar token JWT
    app.post(BASE_URL_API + "/auth/login", (req, res) => {
        const { username, password } = req.body;

        usersDb.find({ username }, async (err, docs) => {
            if (docs.length === 0) {
                return res.status(401).json({ message: "Credenciales inválidas" });
            }

            const user = docs[0];
            // Comparamos la contraseña enviada con la encriptada
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(401).json({ message: "Credenciales inválidas" });
            }

            // Si es correcto, generamos el Token (válido por 2 horas)
            const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '2h' });

            res.status(200).json({ token });
        });
    });

    // 6. DELETE RECURSO ESPECÍFICO
    app.delete(BASE_URL_API + "/global-ads-performance/:region/:date", verifyToken,(req, res) => {
        const { region, date } = req.params;

        db.remove({ region: region, date: date }, {}, (err, numRemoved) => {
            if (numRemoved === 0) {
                return res.sendStatus(404); // 404 Not Found si no existía
            }
            res.sendStatus(200); // 200 OK
        });
    });

    // 7. PUT RECURSO ESPECÍFICO (Actualizar)
    app.put(BASE_URL_API + "/global-ads-performance/:region/:date", verifyToken, (req, res) => {
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
    app.post(BASE_URL_API + "/global-ads-performance/:region/:date", (req, res) => {
        res.sendStatus(405); // Method Not Allowed
    });
    
    app.put(BASE_URL_API + "/global-ads-performance", (req, res) => {
        res.sendStatus(405); // Method Not Allowed
    });


}
