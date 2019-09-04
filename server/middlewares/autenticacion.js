const jwt = require('jsonwebtoken');


// ===============
// Verificar Token
// ===============

let verificarToken = (req, res, next) => { // next indica continuar con la ejecución del programa

    let token = req.get('authorization');

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }

        req.usuario = decoded.usuario;
        next();
    });
};


// ===============
// Verifica AdminRole
// ===============

let verificarAdmin_Role = (req, res, next) => {

    let usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.status(401).json({
            ok: false,
            err: {
                message: 'El usuario no es administrador ',
            },

        });
    }
}

module.exports = {
    verificarToken,
    verificarAdmin_Role
}