let BASE_URL_API = "/api/v1";

export function loadBackEndECR(app){
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

    let dailyIndicators = [];

    // 12. Carga de datos iniciales
    app.get(BASE_URL_API + '/daily-global-stock-market-indicators/loadInitialData', (req, res) => {
        if (dailyIndicators.length === 0) {
            dailyIndicators = [
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
            res.status(201).json(dailyIndicators); 
        } else {
            res.status(200).json(dailyIndicators); 
        }
    });

    // 13 y 14. METODOS DE LA TABLA AZUL Y CUADRO VERDE
    // =====================================================================

    // --- 1. COLECCIÓN BASE (/api/v1/daily-global-stock-market-indicators) ---

    // GET: Devolver toda la colección
    app.get(BASE_URL_API + '/daily-global-stock-market-indicators', (req, res) => {
        res.status(200).json(dailyIndicators);
    });

    // POST: Crear un nuevo recurso
    app.post(BASE_URL_API + '/daily-global-stock-market-indicators', (req, res) => {
        const newData = req.body;
        
        // Validación: Que vengan los campos esenciales
        if (!newData || !newData.region || !newData.index_name || !newData.date || !newData.close) {
            return res.status(400).json({ message: "Bad Request: Faltan campos requeridos" });
        }

        // Comprobar si ya existe el índice en esa región
        const exists = dailyIndicators.find(d => d.region === newData.region && d.index_name === newData.index_name);
        if (exists) {
            return res.status(409).json({ message: "Conflict: El recurso ya existe" });
        }

        dailyIndicators.push(newData);
        res.status(201).json({ message: "Created" });
    });

    // PUT: Actualizar toda la colección (NO PERMITIDO)
    app.put(BASE_URL_API + '/daily-global-stock-market-indicators', (req, res) => {
        res.status(405).json({ message: "Method Not Allowed" });
    });

    // DELETE: Borrar toda la colección
    app.delete(BASE_URL_API + '/daily-global-stock-market-indicators', (req, res) => {
        dailyIndicators = [];
        res.status(200).json({ message: "All data deleted" });
    });

    // --- 2. BÚSQUEDA POR UN PARÁMETRO (/api/v1/.../Europe) ---

    // GET: Devolver todos los datos de una región
    app.get(BASE_URL_API + '/daily-global-stock-market-indicators/:region', (req, res) => {
        const { region } = req.params;
        const filteredData = dailyIndicators.filter(d => d.region === region);
        
        if (filteredData.length > 0) {
            res.status(200).json(filteredData);
        } else {
            res.status(404).json({ message: "Not Found" });
        }
    });

    // --- 3. RECURSO CONCRETO (/api/v1/.../Europe/DAX) ---

    // GET: Devolver un recurso concreto
    app.get(BASE_URL_API + '/daily-global-stock-market-indicators/:region/:index_name', (req, res) => {
        const { region, index_name } = req.params;
        const resource = dailyIndicators.find(d => d.region === region && d.index_name === index_name);
        
        if (resource) {
            res.status(200).json(resource);
        } else {
            res.status(404).json({ message: "Not Found" });
        }
    });

    // POST: Crear un recurso en una URL concreta (NO PERMITIDO)
    app.post(BASE_URL_API + '/daily-global-stock-market-indicators/:region/:index_name', (req, res) => {
        res.status(405).json({ message: "Method Not Allowed" });
    });

    // PUT: Actualizar un recurso concreto
    app.put(BASE_URL_API + '/daily-global-stock-market-indicators/:region/:index_name', (req, res) => {
        const { region, index_name } = req.params;
        const updatedData = req.body;

        // Validación: El cuerpo debe coincidir con la URL para no liarla
        if (!updatedData || updatedData.region !== region || updatedData.index_name !== index_name) {
            return res.status(400).json({ message: "Bad Request: Los IDs del body no coinciden con la URL o faltan datos" });
        }

        const index = dailyIndicators.findIndex(d => d.region === region && d.index_name === index_name);
        
        if (index !== -1) {
            dailyIndicators[index] = { ...dailyIndicators[index], ...updatedData };
            res.status(200).json({ message: "Updated" });
        } else {
            res.status(404).json({ message: "Not Found" });
        }
    });

    // DELETE: Borrar un recurso concreto
    app.delete(BASE_URL_API + '/daily-global-stock-market-indicators/:region/:index_name', (req, res) => {
        const { region, index_name } = req.params;
        const initialLength = dailyIndicators.length;
        
        dailyIndicators = dailyIndicators.filter(d => !(d.region === region && d.index_name === index_name));
        
        if (dailyIndicators.length < initialLength) {
            res.status(200).json({ message: "Deleted" });
        } else {
            res.status(404).json({ message: "Not Found" });
        }
    });

    app.get(BASE_URL_API + '/daily-global-stock-market-indicators/docs', (req, res) => {
        res.redirect('https://documenter.getpostman.com/view/52708852/2sBXigLYL8');
    });

}