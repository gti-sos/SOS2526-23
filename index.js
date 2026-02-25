let cool = require('cool-ascii-faces');
let express = require('express');
let bodyParser = require('body-parser');
let index_MRR = require('index-MRR.js');
let PORT = process.env.PORT || 3000;
let BASE_URL_API = "/api/v1";

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
  res.send(`<html> <body> ${index_MRR} </body> </html>`);
});

app.listen(PORT, () => {
  console.log('Server is running on http://localhost:3000');
});
