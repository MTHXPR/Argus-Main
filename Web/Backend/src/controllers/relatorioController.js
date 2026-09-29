const pool = require('../config/database');

async function listarRelatorios(req, res) {
    try {
        const empresaId = req.usuario.empresaId;

        const [relatorios] = await pool.query(
            `SELECT
                id,
                usuario_id,
                titulo,
                periodo_inicio,
                periodo_fim,
                produtividade
             FROM relatorios
             WHERE empresa_id = ?
             ORDER BY id DESC`,
            [empresaId]
        );

        res.json({
            relatorios
        });

    } catch (error) {
        console.error('Erro ao listar relatórios:', error);

        res.status(500).json({
            message: 'Erro interno do servidor.'
        });
    }
}

module.exports = {
    listarRelatorios
};