import dataStore from "nedb";

let BASE_URL_API = "/api/v1";

let db = new dataStore();

export function loadBackEndDAV(app){

    let datosDAV = [];
    db.insert(datosDAV);

     app.get(BASE_URL_API + "/global-ads-performance", (req, res) => {
        let filtrado = dataDAV;
        let regionName = req.query.region;
        let dateN1 = req.query.from;
        let dateN2 = req.query.to;
        let industry = req.query.industry;

           if (regionName){
            filtrado = filtrado.filter(d => d.region.toLowerCase() === regionName.toLowerCase());
        };

        if (dateN1 && dateN2){
            let from = new Date(dateN1).getTime();
            let to = new Date(dateN2).getTime();

            filtrado = filtrado.filter(d => {
                let itemDate = new Date(d.date).getTime();
                return itemDate >= from && itemDate <= to;
            });
        }

         if (industry){
            filtrado = filtrado.filter(d => d.industry.toLowerCase() === industry.toLowerCase());
        };

           res.status(200, "OK").json(filtrado);
    });

    app.get(BASE_URL_API + "/global-ads-performance/loadInitialData", (req, res) => {
    if (dataDAV.length !== 0) {
        return res.status(409, "CONFLICT").json({message: "Ya existen datos"});
    }


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

    dataDAV.push(...newData);
    return res.status(200, "OK").json(dataDAV);
    });
    
    // 5. POST (Crear)
    app.post(BASE_URL_API, (req, res) => {
        const newEntry = req.body;
        const exists = dataDAV.some(d => d.region === newEntry.region && d.date === newEntry.date);
        
        if (exists) {
            res.sendStatus(409);
        } else {
            dataDAV.push(newEntry);
            res.sendStatus(201);
        }
    });


    app.get('/samples/DAV', (req, res) => {
    let regionElegidaDav = ["North America", "Asia", "Europe"];
    let texto = "";

    regionElegidaDav.forEach((n) => {
        let filtro = dataDAV.filter((d) => d.region === n);
        let resultado = filtro.length > 0
            ? filtro.reduce((a, d) => a + d.impression, 0) / filtro.length 
            : 0;
            
        texto += "La media de 'impression' en &nbsp;" + n + " &nbsp; es &nbsp; " + resultado.toFixed(2) + "<br><br>";
    });

    res.send(`<html> <body> ${texto} </body> </html>`);
});

app.get(BASE_URL_API + "/google-ads-performance", (req, res) => {
  res.status(200, "OK").json(dataDAV)
});


// Carga de datos iniciales
app.get(BASE_URL_API+`/google-ads-performance/loadInitialData`, (req, res) => {
    if (dataDAV.length === 0) {
        newData = [...dataDAV]; //copia de los elementos de DataDav
        res.status(201).json(newData); // codigo exito creacion
        dataDAV.push(newData);
    } else {
        res.status(409).json({message: "Ya existen datos"});

    }
});

// GET COLECCIÓN (Con soporte para filtrado)
app.get(BASE_URL_API + "/google-ads-performance", (req, res) => {
    let filteredData = [...data];
    const { region, from, to, platform } = req.query; //son variables de tipo query, lo que va despues de '?' en la URL

    //filtro region
    if (region) filteredData = filteredData.filter(d => d.region.toLowerCase() === region.toLowerCase());

     // Filtrado por rango de fechas (ISO strings funcionan bien para comparación alfabética)
    if (from && to) {
        filteredData = filteredData.filter(d => d.date >= from && d.date <= to);
    }

    //filtro plataforma
    if (platform) filteredData = filteredData.filter(d => d.platform.toLowerCase() === platform.toLowerCase());
    
    if (industry) {
        filteredData = filteredData.filter(d => d.industry.toLowerCase() === industry.toLowerCase());
    }
   
    res.json(filteredData); // Siempre devuelve ARRAY (aunque esté vacío)
});

// 3. GET RECURSO ESPECÍFICO (Objeto único)
app.get(BASE_URL_API+ "/google-ads-performance/:region/:date", (req, res) => {
    const { region, date } = req.params;
    const resource = data.find(d => d.region.toLowerCase() === region.toLowerCase() && d.date === date);
    
    if (resource) {
        res.json(resource);
    } else {
        res.sendStatus(404);// errror not found
    }
});
// 4. GET BÚSQUEDA EN RECURSO ESPECÍFICO (Ej: /Asia?from=2024-01-01)
app.get(BASE_URL_API+ "/google-ads-performance/:region", (req, res) => {
    const { region } = req.params;
    const { from, to } = req.query;
    
    let filteredData = data.filter(d => d.region.toLowerCase() === region.toLowerCase());
    
    if (from && to) {
        filteredData = filteredData.filter(d => d.date >= from && d.date <= to);
    }
    
    res.json(filteredData); // Devuelve ARRAY
});


// 6. PUT (Actualizar recurso concreto)
app.put(`${BASE_URL_API}/:region/:date`, (req, res) => {
    const { region, date } = req.params;
    const updatedEntry = req.body;

    if (updatedEntry.region !== region || updatedEntry.date !== date) {
        return res.sendStatus(400);
    }

    const index = data.findIndex(d => d.region === region && d.date === date);
    if (index !== -1) {
        data[index] = updatedEntry;
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

// 7. DELETE (Uno solo)
app.delete(`${BASE_URL_API}/:region/:date`, (req, res) => {
    const { region, date } = req.params;
    const initialLength = data.length;
    data = data.filter(d => !(d.region === region && d.date === date));
    
    res.sendStatus(data.length < initialLength ? 200 : 404);
});

// 8. DELETE (Colección completa)
app.delete(BASE_URL_API, (req, res) => {
    data = [];
    res.sendStatus(200);
});

// MÉTODOS PROHIBIDOS
app.post(`${BASE_URL_API}/:region/:date`, (req, res) => res.sendStatus(405));
app.put(BASE_URL_API, (req, res) => res.sendStatus(405));

}
