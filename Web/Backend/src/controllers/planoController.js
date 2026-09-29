const pool = require('../config/database');

async function listarPlanosMensais(req, res) {
    try {
        const [planos] = await pool.query(
            'SELECT * FROM planos_mensais'
        );

        res.json(planos);
    } catch (error) {
        console.error('Erro ao buscar planos mensais:', error);

        res.status(500).json({
            message: 'Erro ao buscar planos mensais.'
        });
    }
}

async function listarPlanosAnuais(req, res) {
    try {
        const [planos] = await pool.query(
            'SELECT * FROM planos_anuais'
        );

        res.json(planos);
    } catch (error) {
        console.error('Erro ao buscar planos anuais:', error);

        res.status(500).json({
            message: 'Erro ao buscar planos anuais.'
        });
    }
}

module.exports = {
    listarPlanosMensais,
    listarPlanosAnuais
};