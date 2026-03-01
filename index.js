let cool = require('cool-ascii-faces');
let express = require('express');
let bodyParser = require('body-parser');
let PORT = process.env.PORT || 3000;
let BASE_URL_API = "/api/v1";

// -----------------------------------------------------------------
// DATOS DE MARÍA RODRÍGUEZ (MRR)
// -----------------------------------------------------------------
let datosMRR = [
    {region: "North America", date: "2024-01-01", product_category: "Electronics", product_name: "iPhone 14 Pro", quantity_sold: 2, unit_price: 999.99, total: 1999.98, payment_method: "Credit Card"},
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

// -----------------------------------------------------------------
// DATOS DE DAVID AYLLÓN (DAV)
// -----------------------------------------------------------------
const dataDAV = [
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

// -----------------------------------------------------------------
// DATOS DE EMILIO CUEVAS (ECR)
// -----------------------------------------------------------------
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

const app = express();

app.use('/about', express.static('public'));

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/cool', (req, res) => {
    res.send(`<html> <body> <h1> ${cool()} </h1> </body> </html>`);
});

// -----------------------------------------------------------------
// RUTA DE MARÍA RODRÍGUEZ (MRR)
// -----------------------------------------------------------------
app.get('/samples/MRR', (req, res) => {
    let regionElegida = ["North America", "Asia", "Europe"];
    let texto = "";

    regionElegida.forEach((n) => {
        let filtro = datosMRR.filter((d) => d.region === n);
        let resultado = filtro.reduce((a, d) => a + d.quantity_sold, 0) / filtro.length;
        texto += "La media de unidades por compra en &nbsp;" + n + " &nbsp; es &nbsp; " + resultado + "<br><br>";
    });

    res.send(`<html> <body> ${texto} </body> </html>`);
});

// -----------------------------------------------------------------
// RUTA DE DAV
// -----------------------------------------------------------------
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

// -----------------------------------------------------------------
// RUTA DE EMILIO CUEVAS (ECR)
// -----------------------------------------------------------------
app.get('/samples/ECR', (req, res) => {
    const regionObjetivo = "Europe";
    const datosEuropa = datosIndices.filter(indice => indice.region === regionObjetivo);
    
    let mensajeRespuesta = "";

    if (datosEuropa.length > 0) {
        const valoresCierre = datosEuropa.map(indice => indice.close);
        const sumaCierre = valoresCierre.reduce((acumulador, valorActual) => acumulador + valorActual, 0);
        const mediaCierre = sumaCierre / datosEuropa.length;

        mensajeRespuesta = `La media del valor de cierre (close) para la región de ${regionObjetivo} es: ${mediaCierre.toFixed(2)}`;
    } else {
        mensajeRespuesta = `No se encontraron datos para la región: ${regionObjetivo}`;
    }

    res.send(`<html> <body> <h2>Cálculo de Índices</h2> <p>${mensajeRespuesta}</p> </body> </html>`);
});

app.listen(PORT, () => {
    console.log('Server is running on http://localhost:' + PORT);
});