const pool = require('../config/database');

async function listarAtividades(req, res) {
    try {
        const empresaId = req.usuario.empresaId;

        const [atividades] = await pool.query(
            `SELECT
                a.id,
                a.maquina_id,
                m.nome AS maquina,
                a.aplicativo_id,
                ap.nome AS aplicativo,
                a.site_id,
                s.url AS site,
                a.descricao,
                a.inicio,
                a.fim,
                a.tempo_uso,
                a.classificacao
             FROM atividades a
             INNER JOIN maquinas m
                ON a.maquina_id = m.id
             LEFT JOIN aplicativos ap
                ON a.aplicativo_id = ap.id
             LEFT JOIN sites s
                ON a.site_id = s.id
             WHERE m.empresa_id = ?
             ORDER BY a.inicio DESC`,
            [empresaId]
        );

        res.json({
            atividades
        });

    } catch (error) {
        console.error('Erro ao listar atividades:', error);

        res.status(500).json({
            message: 'Erro interno do servidor.'
        });
    }
}

module.exports = {
    listarAtividades
};