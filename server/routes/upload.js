const express = require('express');
const fileUpload = require('express-fileupload');
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const app = express();
const fs = require('fs');
const path = require('path');

app.use(fileUpload({ useTempFiles: true }));

app.put('/upload/:tipo/:id', (req, res) => { // lo ponemos put para actualizar (aunque trabaja igual que el post)
    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files) { // caen en el objeto 'files'
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningún archivo!'
            }
        });
    }

    // Válidación de tipos permitidos.
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos validos únicamente son: ' + tiposValidos.join(','),
            }
        })
    }

    // Definición y validación de extenciones de archivos
    let archivo = req.files.archivo;
    let nombreSeparado = archivo.name.split('.');
    let extension = nombreSeparado[nombreSeparado.length - 1];
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg',]; // Extensiones válidas    

    if (extensionesValidas.indexOf(extension) < 0) {

        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones válidas son: ' + extensionesValidas.join(','),
                extension
            }
        });
    }

    // Subida de archivos
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`

    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => { // directorio en la raíz 
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // Imagen de usuario  cargada - Lista para ser actualizada.
        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }
    });
});


function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borrarArchivo(nombreArchivo, 'usuarios')
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            borrarArchivo(nombreArchivo, 'usuarios')
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        }

        borrarArchivo(usuarioDB.img, 'usuarios')
        usuarioDB.img = nombreArchivo;
        usuarioDB.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            });
        });
    });
};

function imagenProducto(id, res, nombreArchivo) {
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borrarArchivo(nombreArchivo, 'productos')
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            borrarArchivo(nombreArchivo, 'productos')
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Producto no Existe'
                }
            });
        }

        borrarArchivo(productoDB.img, 'productos')
        productoDB.img = nombreArchivo;
        productoDB.save((err, productoGuardado) => {
            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            })
        });
    });
};

function borrarArchivo(nombreImagen, tipo) {

    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    if (fs.existsSync(pathImagen)) { // Funciona de manera sincrona
        fs.unlinkSync(pathImagen);   // Si existe, borramos el path
    }
}

module.exports = app;