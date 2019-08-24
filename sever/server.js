require('./config/config');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/usuario', function (req, res) {  // Actualizar datos
 res.json('Get Usuarios')
});


app.post('/usuario', function (req, res) {  // actualizar nuevos registros
    let body = req.body;
    if (body.nombre === undefined) {
        res.status(400).json({
            ok: false,
            mensaje: 'El nombre es necesario',
        });
    } else {

        res.json({persona:body});
    }
});
 
app.put('/usuario/:id', function (req, res) {  // crear nuevos registros
    let id = req.params.id; //El id del params y del url deben ser iguales
    res.json ({
        id
    });
});

app.delete('/usuario', function (req, res) {  // delete nuevos registros
 res.json('Delete Usuarios')
});





app.listen(process.env.PORT, () =>{
console.log('Escuchando el servidor en el puerto:', process.env.PORT)
});