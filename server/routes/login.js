const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);
const Usuario = require('../models/usuario');
const app = express();

app.post('/login', (req, res) => {

    let body = req.body;
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
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
        }, process.env.SEED, {
            expiresIn: process.env.CADUCIDAD_TOKEN
        });

        res.json({
            ok: true,
            usuario: usuarioDB.usuario,
            token
        });
    });

});

// Configuraciones de google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true,

    }
}

app.post('/google', async (req, res) => {

    let token = req.body.idtoken;
    let googleUSer = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                err: e
            });
        });

    Usuario.findOne({ email: googleUSer.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe autenticarse con su usuario y contraseña'
                    }
                })
            } else {
                let token = jwt.sign({usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN })

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                })
            }
        } else {
            // Si el usuario no existe en nuestra DB
            let usuario = new Usuario();
            usuario.nombre = googleUSer.nombre;
            usuario.email = googleUSer.email;
            usuario.img = googleUSer.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                };

                let token = jwt.sign({
                    usuario: usuarioDB,
                }, process.env.SEED, {
                    expiresIn: process.env.CADUCIDAD_TOKEN
                })

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                })


            });
        }
    });
});

module.exports = app;