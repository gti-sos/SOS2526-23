import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { handler } from './src/front/build/handler.js';

import { loadBackEndMRR } from './src/back/index-MRR.js';
import { loadBackEndDAV } from './src/back/index-DAV.js';
import { loadBackEndECR } from './src/back/index-ECR.js';

let PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());

app.use('/about', express.static('public'));
app.use(bodyParser.json());

loadBackEndDAV(app);
loadBackEndECR(app);
loadBackEndMRR(app);

app.use(handler);

app.listen(PORT, () => {
    console.log('Server is running on http://localhost:' + PORT);
});