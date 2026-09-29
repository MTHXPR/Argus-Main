const bcrypt = require('bcrypt');
const pool = require('../config/database');
const jwt = require('jsonwebtoken');

async function cadastrar(req, res) {
    const {
        empresaNome,
        cnpj,
        nome,
        email,
        senha
    } = req.body;

    try {
        if (!empresaNome || !cnpj || !nome || !email || !senha) {
            return res.status(400).json({
                message: 'Todos os campos são obrigatórios.'
            });
        }

        const [usuarioExistente] = await pool.query(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );

        if (usuarioExistente.length > 0) {
            return res.status(409).json({
                message: 'Este e-mail já está cadastrado.'
            });
        }

        const [empresaExistente] = await pool.query(
            'SELECT id FROM empresas WHERE cnpj = ?',
            [cnpj]
        );

        if (empresaExistente.length > 0) {
            return res.status(409).json({
                message: 'Este CNPJ já está cadastrado.'
            });
        }

        const [empresaResult] = await pool.query(
            `INSERT INTO empresas (nome, cnpj)
             VALUES (?, ?)`,
            [empresaNome, cnpj]
        );

        const empresaId = empresaResult.insertId;

        const senhaHash = await bcrypt.hash(senha, 10);

        const [usuarioResult] = await pool.query(
            `INSERT INTO usuarios
                (empresa_id, nome, email, senha)
             VALUES (?, ?, ?, ?)`,
            [empresaId, nome, email, senhaHash]
        );

        res.status(201).json({
            message: 'Cadastro realizado com sucesso.',
            usuario: {
                id: usuarioResult.insertId,
                nome,
                email,
                empresaId
            }
        });

    } catch (error) {
        console.error('Erro ao cadastrar:', error);

        res.status(500).json({
            message: 'Erro interno do servidor.'
        });
    }
}

async function login(req, res) {
    const { email, senha } = req.body;

    try {
        if (!email || !senha) {
            return res.status(400).json({
                message: 'E-mail e senha são obrigatórios.'
            });
        }

        const [usuarios] = await pool.query(
            `SELECT id, empresa_id, nome, email, senha
             FROM usuarios
             WHERE email = ?`,
            [email]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                message: 'E-mail ou senha inválidos.'
            });
        }

        const usuario = usuarios[0];

        const senhaValida = await bcrypt.compare(
            senha,
            usuario.senha
        );

        if (!senhaValida) {
            return res.status(401).json({
                message: 'E-mail ou senha inválidos.'
            });
        }

        const token = jwt.sign(
            {
                id: usuario.id,
                empresaId: usuario.empresa_id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d'
            }
        );

        res.json({
            message: 'Login realizado com sucesso.',
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                empresaId: usuario.empresa_id
            }
        });

    } catch (error) {
        console.error('Erro ao realizar login:', error);

        res.status(500).json({
            message: 'Erro interno do servidor.'
        });
    }
}

async function perfil(req, res) {
    try {
        const [usuarios] = await pool.query(
            `SELECT id, empresa_id, nome, email, telefone, cargo, foto
             FROM usuarios
             WHERE id = ?`,
            [req.usuario.id]
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
    cadastrar,
    login,
    perfil
};