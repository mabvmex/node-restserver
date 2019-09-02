require('./config/config');
require('colors');

const express = require('express')
const mongoose = require('mongoose');

const app = express();
const bodyParser = require ('body-parser');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(require('./routes/usuario'));

// Se agrega el "useNewUrlParser: true" porqué la función de conexión está marcada como deprecada si no se usa de está manera.
// new parser, pass option { useNewUrlParser: true } to MongoClient.connect.
mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true }, (e, resp) => {
        if (e) throw e;
        console.log('Base de Datos ONLINE'.bold.yellow);
    });

app.listen(port, () => {
    console.log(`Escuchando el servidor en el puerto: ${port}`.bold.yellow)
});