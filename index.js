import express from 'express';
import bodyParser from 'body-parser';
//import dataStore from 'nedb';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { loadBackEndMRR } from './src/back/index-MRR.js';
import { loadBackEndDAV } from './src/back/index-DAV.js';
import { loadBackEndECR } from './src/back/index-ECR.js';

let PORT = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.json());

app.use('/', express.static('public'));
app.use('/about', express.static(path.join(__dirname, "public", "about.html")));

app.get('/', (req, res) => {
    res.send(`<h1>SOS2526-23</h1>
        <hr>
        <ul>
            <li><b> About</b>: <a href="https://sos2526-23.onrender.com/about" target="_blank">https://sos2526-23.onrender.com/about</a></li>
            <br>
            <li><b> API's</b>:
                <ul style="list-style-type: '-'">
                    <li> &nbsp; <a href="https://sos2526-23.onrender.com/api/v1/global-ads-performance/docs" target="_blank">https://sos2526-23.onrender.com/api/v1/global-ads-performance/docs</a> (developep by David Ayllón Vela)</li>
                    <li> &nbsp; <a href="https://sos2526-23.onrender.com/api/v1/daily-global-stock-market-indicators/docs" target="_blank">https://sos2526-23.onrender.com/api/v1/daily-global-stock-market-indicators/docs</a> (developed by Emilio Cuevas Rendón)</li>
                    <li> &nbsp; <a href="https://sos2526-23.onrender.com/api/v1/online-sales-popular-marketplaces/docs" target="_blank">https://sos2526-23.onrender.com/api/v1/online-sales-popular-marketplaces/docs</a> (developed by María Rodríguez Romero)</li>
                </ul>
            </li>
        </ul>`
    );
});

loadBackEndDAV(app);
loadBackEndECR(app);
loadBackEndMRR(app);

app.listen(PORT, () => {
    console.log('Server is running on http://localhost:' + PORT);
});