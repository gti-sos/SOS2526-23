let cool = require('cool-ascii-faces');
let express = require('express');
let bodyParser = require('body-parser');
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

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
