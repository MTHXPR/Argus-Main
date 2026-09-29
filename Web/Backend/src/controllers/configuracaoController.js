const pool = require('../config/database');

async function listarConfiguracoes(req, res) {
    try {
        const usuarioId = req.usuario.id;
        const empresaId = req.usuario.empresaId;

        const [configuracoes] = await pool.query(
            `SELECT
                id,
                chave,
                valor
             FROM configuracoes
             WHERE usuario_id = ?
             AND empresa_id = ?
             ORDER BY id ASC`,
            [usuarioId, empresaId]
        );

        res.json({
            configuracoes
        });

    } catch (error) {
        console.error('Erro ao listar configurações:', error);

        res.status(500).json({
            message: 'Erro interno do servidor.'
        });
    }
}

async function salvarConfiguracao(req, res) {
    try {
        const usuarioId = req.usuario.id;
        const empresaId = req.usuario.empresaId;

        const { chave, valor } = req.body;

        if (!chave || valor === undefined) {
            return res.status(400).json({
                message: 'Chave e valor são obrigatórios.'
            });
        }

        const [existente] = await pool.query(
            `SELECT id
             FROM configuracoes
             WHERE usuario_id = ?
             AND empresa_id = ?
             AND chave = ?`,
            [usuarioId, empresaId, chave]
        );

        if (existente.length > 0) {
            await pool.query(
                `UPDATE configuracoes
                 SET valor = ?
                 WHERE id = ?`,
                [String(valor), existente[0].id]
            );

            return res.json({
                message: 'Configuração atualizada com sucesso.'
            });
        }

        const [resultado] = await pool.query(
            `INSERT INTO configuracoes
                (empresa_id, usuario_id, chave, valor)
             VALUES (?, ?, ?, ?)`,
            [empresaId, usuarioId, chave, String(valor)]
        );

        res.status(201).json({
            message: 'Configuração salva com sucesso.',
            configuracao: {
                id: resultado.insertId,
                chave,
                valor: String(valor)
            }
        });

    } catch (error) {
        console.error('Erro ao salvar configuração:', error);

        res.status(500).json({
            message: 'Erro interno do servidor.'
        });
    }
}

module.exports = {
    listarConfiguracoes,
    salvarConfiguracao
};

