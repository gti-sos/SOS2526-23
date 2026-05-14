import 'dotenv/config'
import bodyParser from 'body-parser';

//Importamos los backends
import { loadBackEndMRR } from './src/back/index-MRR.js';
import { loadBackEndDAV } from './src/back/index-DAV.js';
import { loadBackEndECR } from './src/back/index-ECR.js';

import express from 'express';

import proxyDeDavid from "./src/back/server_proxy/proxy-DAV.js";
import proxyHubspot from "./src/back/server_proxy/proxy-hubspot.js";


import cors from 'cors';
import { handler } from './src/front/build/handler.js';


let PORT = process.env.PORT || 3000;

const app = express();

app.use(cors()); //Permite que la API sea accedida desde cualquier origen
app.use('/about', express.static('public'));
app.use(bodyParser.json());

//Cargamos los backends
loadBackEndDAV(app);
loadBackEndECR(app);
loadBackEndMRR(app);

//Llamada al proxy
proxyDeDavid(app);
proxyHubspot(app);

//Hace el build y construye, obligatoriamente detras de las llamadas a los backends
app.use(handler);

//Arrancamos el servidor
app.listen(PORT, () => {
    console.log('Server is running on http://localhost:' + PORT);
});