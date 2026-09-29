const pool = require('../config/database');

async function listarAlertas(req, res) {
    try {
        const empresaId = req.usuario.empresaId;

        const [alertas] = await pool.query(
            `SELECT
                a.id,
                a.maquina_id,
                m.nome AS maquina,
                a.descricao,
                a.nivel,
                a.status,
                a.data_alerta
             FROM alertas a
             LEFT JOIN maquinas m ON m.id = a.maquina_id
             WHERE a.empresa_id = ?
             ORDER BY a.data_alerta DESC`,
            [empresaId]
        );

        res.json({
            alertas
        });

    } catch (error) {
        console.error('Erro ao listar alertas:', error);

        res.status(500).json({
            message: 'Erro interno do servidor.'
        });
    }
}

module.exports = {
    listarAlertas
};