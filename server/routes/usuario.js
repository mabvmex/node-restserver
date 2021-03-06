const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const Usuario = require('../models/usuario');
const { verificarToken, verificarAdmin_Role } = require('../middlewares/autenticacion'); 
const app = express();


// ===============
// GET
// ===============
app.get('/usuario', verificarToken, (req, res) => {

    let desde = req.query.desde || 0; // opcionales vienen del query
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Usuario.find({ estado: true }, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            Usuario.count({
                estado: true
            }, (err, conteo) => { //cuenta registros

                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo,
                })
            });
        });
    // res.json('Get Usuarios DESARROLLO')
});


// ===============
// POST
// ===============
app.post('/usuario', [verificarToken, verificarAdmin_Role], function (req, res) {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role,
        img: body.img
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        // usuario.password = null;
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
    // *** Código comentado (1)
});


// ===============
// PUT
// ===============
app.put('/usuario/:id', [verificarToken, verificarAdmin_Role], function (req, res) {

    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', /* ' email', 'img',*/ 'role', 'estado']); // req.body

    Usuario.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true
    }, (err, usuarioDB) => { // findById
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        res.json({
            ok: true,
            usuario: usuarioDB,
        });
    });
});


// ===============
// DELETE
// ===============
app.delete('/usuario/:id', [verificarToken, verificarAdmin_Role], function (req, res) { // res.json('Delete Usuarios')

    let id = req.params.id;
    // *** Código comentado (2) ***

    let cambioEstado = { estado: false }
    Usuario.findByIdAndUpdate(id, cambioEstado, { new: true }, (err, usuarioEliminado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!usuarioEliminado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioEliminado,
            status: 'Eliminado'
        });
        // }
    });
});

module.exports = app







/* *** Código comentado (1), Se desechó ***

if (body.nombre === undefined) {
    res.status(400).json({
        ok: false,
    });
        mensaje: 'El nombre es necesario',
} else {
    res.json({
        persona: body
    });
}
*/



/* *** Código comentado (2) ***

Usuario.findByIdAndRemove(id, (e, usuarioEliminado) => {
        if (e) {
            return res.status(400).json({
                ok: false,
                e
            });
        };

*/