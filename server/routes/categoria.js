const express = require('express');
let Categoria = require('../models/categoria.js');
let _ = require('underscore');
let { verificarToken, verificarAdmin_Role } = require('../middlewares/autenticacion');
let app = express();

// ===============
// GET: Que aparezcan todas las categorías
// ===============
app.get('/categoria', verificarToken, (req, res) => {

    // Categoria.find({ estado: true }, 'descripcion estado')
    Categoria.find({})
        .populate('usuario', 'nombre email')
        .sort('descripcion')
        .exec((err, categorias) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            Categoria.countDocuments({
                estado: true
            }, (err, conteo) => {
                res.json({
                    ok: true,
                    categorias,
                    total: conteo,
                });
            });
        })
});

// ===============
// GET: Categoria por ID
// ===============
app.get('/categoria/:id', verificarToken, (req, res) => {
    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };
        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                err: { message: 'El ID no es válido' }
            });
        };
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});


// ===============
// POST: Crear nueva
// ===============
app.post('/categoria/', [verificarToken, verificarAdmin_Role], (req, res) => {
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id,
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB,
        });
    });
});


// ===============
// PUT: Actualizar categoría
// ===============
app.put('/categoria/:id', [verificarToken, verificarAdmin_Role], (req, res) => {

    let id = req.params.id;
    let body = _.pick(req.body, ['descripcion', 'estado']); //body = req.body;

    Categoria.findByIdAndUpdate(id, body, {
        new: true, runValidators: true }, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB,
        });
    });
});


// ===============
// DELETE: Eliminar categorias físicamente.
// ===============
app.delete('/categoria/:id', [verificarToken, verificarAdmin_Role], (req, res) => {
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, { new: true }, (err, categoriaEliminada) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaEliminada) {
            return res.status(400).json({
                ok: false,
                err: { message: 'El ID no existe' }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaEliminada,
            message: 'Eliminada',
        });
    });


});




module.exports = app;