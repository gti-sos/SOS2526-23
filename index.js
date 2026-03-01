let cool = require('cool-ascii-faces');
let express = require('express');
let bodyParser = require('body-parser');
let PORT = process.env.PORT || 3000;
let BASE_URL_API = "/api/v1";

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

const app = express();

app.use('/about', express.static('public'))

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/cool', (req, res) => {
  res.send(`<html> <body> <h1> 
              ${cool()}
            </h1> </body> </html>`);
});

app.get('/samples/MRR', (req, res) => {

  let regionElegida = ["North America", "Asia", "Europe"];
  let texto = "";

  regionElegida.forEach((n) => {
      let filtro = datosMRR.filter((d) => d.region === n);
      let resultado = filtro.reduce((a, d) => a + d.quantity_sold, 0) / filtro.length;
      texto += "La media de unidades por compra en &nbsp" + n + " &nbsp es &nbsp " + resultado + "<br><br>";
  });

  res.send(`<html> <body> ${texto} </body> </html>`);
});

//------------------------------------------------------------------------------------------------------------

app.get('/samples/DAV', (req, res) => {
let regionElegidaDav = ["North America", "Asia", "Europe"];
let texto = "";

regionElegidaDav.forEach((n) => {
    // Filtramos los datos para la región actual
    let filtro = dataDAV.filter((d) => d.region === n);
    
    // Calculamos la media de 'impression' (evitando división por cero si no hay datos)
    let resultado = filtro.length > 0
        ? filtro.reduce((a, d) => a + d.impression, 0) / filtro.length 
        : 0;
        
    // Creamos el texto con el formato solicitado
    texto += "La media de 'impression' en &nbsp" + n + " &nbsp es &nbsp " + resultado.toFixed(2) + "<br><br>";
});

  res.send(`<html> <body> ${texto} </body> </html>`);
});


app.listen(PORT, () => {
  console.log('Server is running on http://localhost:' + PORT);
});
