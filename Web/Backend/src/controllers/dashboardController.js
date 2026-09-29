const pool = require('../config/database');

async function obterDashboard(req, res) {
    try {
        const empresaId = req.usuario.empresaId;

        const [maquinas] = await pool.query(
            `SELECT
                id,
                nome,
                sistema_operacional,
                ip,
                status,
                usuario_id
             FROM maquinas
             WHERE empresa_id = ?
             ORDER BY id DESC`,
            [empresaId]
        );

        const totalMaquinas = maquinas.length;

        const online = maquinas.filter(
            maquina => maquina.status === 'online'
        ).length;

        const offline = maquinas.filter(
            maquina => maquina.status === 'offline'
        ).length;

        const outros = totalMaquinas - online - offline;

        res.json({
            resumo: {
                totalMaquinas,
                online,
                offline,
                outros
            },
            maquinas
        });

    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);

        res.status(500).json({
            message: 'Erro interno do servidor.'
        });
    }
}

module.exports = {
    obterDashboard
};