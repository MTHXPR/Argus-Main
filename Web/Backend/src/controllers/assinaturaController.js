const pool = require('../config/database');

async function buscarAssinatura(req, res) {
    try {
        const empresaId = req.usuario.empresaId;

        const [assinaturas] = await pool.query(
            `SELECT
                a.id,
                a.empresa_id,
                a.plano_mensal_id,
                a.plano_anual_id,
                a.data_inicio,
                a.status,
                pm.nome AS plano_mensal,
                pm.preco AS preco_mensal,
                pa.nome AS plano_anual,
                pa.preco AS preco_anual
             FROM assinaturas a
             LEFT JOIN planos_mensais pm
                ON pm.id = a.plano_mensal_id
             LEFT JOIN planos_anuais pa
                ON pa.id = a.plano_anual_id
             WHERE a.empresa_id = ?
             ORDER BY a.id DESC
             LIMIT 1`,
            [empresaId]
        );

        if (assinaturas.length === 0) {
            return res.status(404).json({
                message: 'Nenhuma assinatura encontrada para esta empresa.'
            });
        }

        const assinatura = assinaturas[0];

        res.json({
            assinatura
        });

    } catch (error) {
        console.error('Erro ao buscar assinatura:', error);

        res.status(500).json({
            message: 'Erro interno do servidor.'
        });
    }
}

module.exports = {
    buscarAssinatura
};