const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const app = express();

app.post('/login', (req, res) => {

    let body = req.body;
    Usuario.findOne({
        email: body.email
    }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) { // Si el usuario de la DB y el usuario del login es diferente => Error
            return res.status(400).json({
                ok: false,
                err: { // Es importante no se sepa que fue lo que falló
                    message: '( Usuario ) o contraseña incorrectos'
                }
            })
        }
        // Si el hash de la DB y el hash login es diferente => Error
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                err: {
                    message: 'Usuario o ( contraseña ) incorrectos'
                },
                ok: false,
            });
        }

        let token = jwt.sign({
            usuario: usuarioDB,
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });
    });

});

module.exports = app;