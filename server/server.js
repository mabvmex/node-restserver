require('./config/config');
require('colors');

const express = require('express')
const mongoose = require('mongoose');
const app = express();
const bodyParser = require ('body-parser');
const path = require('path');

app.use(bodyParser.urlencoded({ extended: false })) // parse applicacation/x-www-form-urlencoded
app.use(bodyParser.json()) // parse aplication/json

// Middleware para habilitar la carpeta publica
app.use(express.static(path.resolve(__dirname, '../public'))); // console.log(path.resolve(__dirname, '../public'))

// Configuración global de rutas
app.use(require('./routes/index')); 

// Se agrega el "useNewUrlParser: true" porqué la función de conexión está marcada como deprecada si no se usa de está manera.
// new parser, pass option { useNewUrlParser: true } to MongoClient.connect.
mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false }, (e, res) => {
    if (e) throw e;
    console.log('Base de Datos ONLINE'.bold.yellow);
});

app.listen(port, () => {
    console.log(`Escuchando el servidor en el puerto: ${port}`.bold.yellow)
});