const pool = require('../config/database');
const { emitirEvento } = require('../config/socket');

async function listarMaquinas(req, res) {
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

        res.json({
            maquinas
        });

    } catch (error) {
        console.error('Erro ao listar máquinas:', error);

        res.status(500).json({
            message: 'Erro interno do servidor.'
        });
    }
}

async function cadastrarMaquina(req, res) {
    try {
        const empresaId = req.usuario.empresaId;

        const {
            nome,
            sistema_operacional,
            ip,
            status,
            usuario_id
        } = req.body;

        if (!nome) {
            return res.status(400).json({
                message: 'O nome da máquina é obrigatório.'
            });
        }

        const [resultado] = await pool.query(
            `INSERT INTO maquinas
                (empresa_id, usuario_id, nome, sistema_operacional, ip, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                empresaId,
                usuario_id || null,
                nome,
                sistema_operacional || null,
                ip || null,
                status || 'offline'
            ]
        );

        res.status(201).json({
            message: 'Máquina cadastrada com sucesso.',
            maquina: {
                id: resultado.insertId,
                empresa_id: empresaId,
                usuario_id: usuario_id || null,
                nome,
                sistema_operacional: sistema_operacional || null,
                ip: ip || null,
                status: status || 'offline'
            }
        });

    } catch (error) {
        console.error('Erro ao cadastrar máquina:', error);

        res.status(500).json({
            message: 'Erro interno do servidor.'
        });
    }
}

async function atualizarMaquina(req, res) {
    try {
        const empresaId = req.usuario.empresaId;
        const { id } = req.params;

        const {
            nome,
            sistema_operacional,
            ip,
            status,
            usuario_id
        } = req.body;

        if (!nome) {
            return res.status(400).json({
                message: 'O nome da máquina é obrigatório.'
            });
        }

        const [resultado] = await pool.query(
            `UPDATE maquinas
             SET
                usuario_id = ?,
                nome = ?,
                sistema_operacional = ?,
                ip = ?,
                status = ?
             WHERE id = ?
             AND empresa_id = ?`,
            [
                usuario_id || null,
                nome,
                sistema_operacional || null,
                ip || null,
                status || 'offline',
                id,
                empresaId
            ]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                message: 'Máquina não encontrada.'
            });
        }
        emitirEvento('maquina:status', {
    id: Number(id),
    nome,
    status: status || 'offline'
});

        res.json({
            message: 'Máquina atualizada com sucesso.'
        });

    } catch (error) {
        console.error('Erro ao atualizar máquina:', error);

        res.status(500).json({
            message: 'Erro interno do servidor.'
        });
    }
}

async function excluirMaquina(req, res) {
    try {
        const empresaId = req.usuario.empresaId;
        const { id } = req.params;

        const [resultado] = await pool.query(
            `DELETE FROM maquinas
             WHERE id = ?
             AND empresa_id = ?`,
            [id, empresaId]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                message: 'Máquina não encontrada.'
            });
        }

        res.json({
            message: 'Máquina excluída com sucesso.'
        });

    } catch (error) {
        console.error('Erro ao excluir máquina:', error);

        res.status(500).json({
            message: 'Erro interno do servidor.'
        });
    }
}

module.exports = {
    listarMaquinas,
    cadastrarMaquina,
    atualizarMaquina,
    excluirMaquina
};