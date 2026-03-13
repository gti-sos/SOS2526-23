//import dataStore from 'nedb';

let BASE_URL_API = "/api/v1";
//let db = new dataStore();

export function loadBackEndMRR(app){
    let datosMRR = [];
    //db.insert(datosMRR);

    app.get(BASE_URL_API + "/online-sales-popular-marketplaces", (req, res) => {
        let filtrado = datosMRR;
        let regionName = req.query.region;
        let dateN1 = req.query.from;
        let dateN2 = req.query.to;
        let prodCategory = req.query.product_category;

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

        if (prodCategory){
            filtrado = filtrado.filter(d => d.product_category.toLowerCase() === prodCategory.toLowerCase());
        };

        res.status(200, "OK").json(filtrado);
    });

    app.get(BASE_URL_API + "/online-sales-popular-marketplaces/loadInitialData", (req, res) => {
    if (datosMRR.length !== 0) {
        return res.status(409, "CONFLICT").json({message: "Ya existen datos"});
    }

    let newData = [{region: "North America", date: "2024-01-01", product_category: "Electronics", product_name: "iPhone 14 Pro", quantity_sold: 2, unit_price: 999.99, total: 1999.98, payment_method: "Credit Card"},
        {region: "North America", date: "2024-01-16", product_category: "Books", product_name: "Salt, Fat, Acid, Heat by Samin Nosrat", quantity_sold: 3, unit_price:35.99, total: 107.97, payment_method: "Credit Card"},
        {region: "North America", date: "2024-03-25", product_category: "Electronics", product_name: "Ring Video Doorbell", quantity_sold: 1, unit_price: 99.99, total: 99.99, payment_method: "Credit Card"},
        {region: "Asia", date: "2024-02-02", product_category: "Clothing", product_name: "Under Armour HeatGear T-shirt", quantity_sold: 5, unit_price: 29.99, total: 149.95, payment_method: "Debit Card"},
        {region: "North America", date: "2024-08-01", product_category: "Books", product_name: "The Girl with the Dragon Tattoo by Stieg Larsson", quantity_sold: 3, unit_price: 10.99, total: 32.97, payment_method: "Credit Card"},
        {region: "North America", date: "2024-02-27", product_category: "Books", product_name: "Educated by Tara Westover", quantity_sold: 3, unit_price: 28, total: 84, payment_method: "Credit Card"},
        {region: "Europe", date: "2024-05-01", product_category: "Home Appliances", product_name: "Hamilton Beach FlexBrew Coffee Maker", quantity_sold: 1, unit_price: 89.99, total: 89.99, payment_method: "PayPal"},
        {region: "Asia", date: "2024-01-06", product_category: "Sports", product_name: "Wilson Evolution Basketball", quantity_sold: 5, unit_price: 29.99, total: 149.95, payment_method: "Credit Card"},
        {region: "Asia", date: "2024-07-07", product_category: "Clothing", product_name: "Nike Dri-FIT Training Shorts", quantity_sold: 4, unit_price: 34.99, total: 139.96, payment_method: "Debit Card"},
        {region: "Europe", date: "2024-08-20", product_category: "Beauty Products", product_name: "Fresh Sugar Lip Treatment", quantity_sold: 1, unit_price: 24, total: 24, payment_method: "PayPal"},
        {region: "Europe", date: "2024-04-16", product_category: "Beauty Products", product_name: "The Ordinary Niacinamide Serum", quantity_sold: 1, unit_price: 6.5, total: 6.5, payment_method: "PayPal"}
    ];

    datosMRR.push(...newData);
    return res.status(200, "OK").json(datosMRR);
    });

    app.post(BASE_URL_API + "/online-sales-popular-marketplaces", (req, res) => {
    let newSale = req.body;
    if (!newSale.region || !newSale.date || !newSale.product_category || !newSale.product_name || !newSale.quantity_sold
        || !newSale.unit_price || !newSale.total || !newSale.payment_method){
            return res.status(400, "BAD REQUEST").json({message: "Es posible que falte algún elemento"});
    };
    let existe = datosMRR.some(sale => sale.region === newSale.region && sale.date === newSale.date && sale.product_name === newSale.product_name);
    if (existe){
        return res.status(409, "CONFLICT").json({message: "Existe un dato idéntico al que se quiere añadir"})
    }
    datosMRR.push(newSale);
    return res.status(201, "CREATED").json({message: "Dato nuevo creado"});
    });

    app.put(BASE_URL_API + "/online-sales-popular-marketplaces", (req, res) => {
    res.status(405, "METHOD NOT ALLOWED").json({message: "No es posible actualizar la lista de datos"})
    });

    app.delete(BASE_URL_API + "/online-sales-popular-marketplaces", (req, res) => {
    datosMRR = [];
    res.status(200, "OK").json({message: "Datos eliminados"})
    });

    app.get(BASE_URL_API + "/online-sales-popular-marketplaces/:region", (req, res) => {
        let filtrado = datosMRR;
        let regionName = req.params.region;
        let dateN1 = req.query.from;
        let dateN2 = req.query.to;
        let prodCategory = req.query.product_category;

        if (dateN1 && dateN2){
            let from = new Date(dateN1).getTime();
            let to = new Date(dateN2).getTime();

            filtrado = filtrado.filter(d => {
                let itemDate = new Date(d.date).getTime();
                return itemDate >= from && itemDate <= to;
            });
        }

        if (prodCategory){
            filtrado = filtrado.filter(d => d.product_category.toLowerCase() === prodCategory.toLowerCase());
        };
        
        let filtro = filtrado.filter(sale => sale.region === regionName);
        res.status(200, "OK").json(filtro);
    });

    app.post(BASE_URL_API + "/online-sales-popular-marketplaces/:region", (req, res) => {
        res.status(405, "METHOD NOT ALLOWED").json({message: "No es posible añadir valores a un dato o varios datos"})
    });

    app.put(BASE_URL_API + "/online-sales-popular-marketplaces/:region/:date", (req, res) => {
        let newSale = req.body;
        let regionName = req.params.region;
        let dateN = req.params.date;
        let id = datosMRR.findIndex(d => d.region === regionName && d.date === dateN);

        if (!newSale.region || !newSale.date || !newSale.product_category || !newSale.product_name || !newSale.quantity_sold
        || !newSale.unit_price || !newSale.total || !newSale.payment_method){
            return res.status(400, "BAD REQUEST").json({message: "Es posible que falte algún elemento"});
        };

        if (regionName !== newSale.region || dateN !== newSale.date ){
            return res.status(400, "BAD REQUEST").json({message: "No coincide la region o la fecha con la que se quiere actualizar"});
        }

        if (id === -1) {
            return res.status(404, "NOT FOUND").json({ message: "Recurso no encontrado" });
        }

        datosMRR[id] = newSale;
        res.status(200, "OK").json(datosMRR[id]);
    });

    app.delete(BASE_URL_API + "/online-sales-popular-marketplaces/:region/:date", (req, res) => {
        let regionName = req.params.region;
        let dateN = req.params.date;
        let index = datosMRR.findIndex(d => d.region === regionName && d.date === dateN);

        if (index === -1) {
            return res.status(404).json({ message: "No encontrado" });
        }

        datosMRR.splice(index, 1);
        res.status(200, "OK").json(datosMRR);
    });

}


