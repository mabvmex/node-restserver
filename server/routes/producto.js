const express = require('express');
const { verificarToken, verificarAdmin_Role } = require('../middlewares/autenticacion');
let app = express();
let _ = require('underscore');
let Producto = require('../models/producto');


// ===============
// GET: Productos
// ===============
app.get('/productos', verificarToken, (req, res) => {

let desde = req.query.desde || 0;
    desde = Number(desde);

let hasta = req.query.hasta || 50;
    hasta = Number(hasta);

    // Producto.find({})
    Producto.find(/*{ disponible: true },  'descripcion disponible' */) 
    .skip(desde)
    .limit(hasta)
    .populate('usuario', 'nombre email')
    .populate('categoria', 'descripcion')
    // .sort('categoria')
    .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            Producto.countDocuments(/* { disponible: true }, */ (err, conteo) => {
                res.json({
                    ok: true,
                    productos,
                    total: conteo
                });
            });
        });
});


// ===============
// GET: Productos por ID
// ===============
app.get('/productos/:id', verificarToken, (req, res) => {

    let id = req.params.id;
    Producto.findById(id)
    .populate('usuario', 'nombre email')
    .populate('categoria', 'descripcion')
    .exec((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: { message: 'El ID no es válido' }
            });
        }
        res.json ({
            ok: true,
            producto: productoDB
        });
    });
});


// ===============
// Buscar Productos
// ===============
app.get('/productos/buscar/:termino', verificarToken, (req, res) => {

    termino = req.params.termino;
    
    let regex = new RegExp (termino, 'i');

    Producto.find({nombre: regex})
    .populate('categoria', 'nombre')
    .exec((err, productos) => {
        if (err) {
            return res.status(500).json({
                err,
            });
        }

        res.json({
            ok: true,
            productos
        })
    });
});

// ===============
// POST: Crear nuevo Producto
// ===============
app.post('/productos', [verificarToken, verificarAdmin_Role], (req, res) => {
    let body = req.body;

    let producto = new Producto({
        usuario: req.usuario._id,
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripción: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria

    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };

        res.status(201).json({
            ok: true,
            producto: productoDB
        });
    });
});

// ===============
// PUT: Actualizar productos
// ===============
app.put('/productos/:id', verificarToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Producto.findById(id, (err, productoDB) =>{
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: { message: 'El ID no existe'}
            });
        }

        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.categoria = body.categoria;
        productoDB.disponible = body.disponible;
        productoDB.descripcion = body.descripcion;
        
        productoDB.save((err, productoGuardado) => {
            if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        
        res.json({
            ok: true,
        producto: productoGuardado
        });

        })
        

        // res.json({
        //     ok: true,
        // producto: productoDB
        // });
    });
});

// ===============
// DELETE: Ocultar productos
// ===============
app.delete('/productos/:id', verificarToken, (req, res) => {
    
    let id = req.params.id;
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB.disponible) {
            return res.status(400).json({
                ok: false,
                err: { message: 'El ID no existe'}
            });
        }
        productoDB.disponible = false;
        productoDB.save((err, productoEliminado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                producto: productoEliminado,
                message: 'Eliminado'
            });
        });
    });
});



module.exports = app;