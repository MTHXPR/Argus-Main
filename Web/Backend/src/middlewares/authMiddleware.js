const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: 'Token não informado.'
            });
        }

        const partes = authHeader.split(' ');

        if (partes.length !== 2 || partes[0] !== 'Bearer') {
            return res.status(401).json({
                message: 'Formato do token inválido.'
            });
        }

        const token = partes[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.usuario = decoded;

        next();

    } catch (error) {
        console.error('Erro ao autenticar:', error);

        return res.status(401).json({
            message: 'Token inválido ou expirado.'
        });
    }
}

module.exports = autenticar;