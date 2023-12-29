require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const app = express();
const connectDB = require('./scripts/connection');
const port = process.env.PORT;
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('../src/swagger/swagger_output.json');

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

const corsOptions = {
  credentials: true,
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.get('/', (req, res) => {
  res.send('Hello World');
});

connectDB();

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(routes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
}

module.exports = app;
