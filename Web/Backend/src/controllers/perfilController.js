const pool = require('../config/database');

async function buscarPerfil(req, res) {
    try {
        const usuarioId = req.usuario.id;

        const [usuarios] = await pool.query(
            `SELECT
                id,
                nome,
                email,
                telefone,
                cargo,
                foto,
                empresa_id
             FROM usuarios
             WHERE id = ?`,
            [usuarioId]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                message: 'Usuário não encontrado.'
            });
        }

        const usuario = usuarios[0];

        res.json({
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                telefone: usuario.telefone,
                cargo: usuario.cargo,
                foto: usuario.foto,
                empresaId: usuario.empresa_id
            }
        });

    } catch (error) {
        console.error('Erro ao buscar perfil:', error);

        res.status(500).json({
            message: 'Erro interno do servidor.'
        });
    }
}

module.exports = {
    buscarPerfil
};