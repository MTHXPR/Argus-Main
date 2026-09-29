const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const { configurarSocket } = require('./config/socket');

const pool = require('./config/database');
const planoRoutes = require('./routes/planoRoutes');
const authRoutes = require('./routes/authRoutes');
const maquinaRoutes = require('./routes/maquinaRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const atividadeRoutes = require('./routes/atividadeRoutes');
const perfilRoutes = require('./routes/perfilRoutes');
const relatorioRoutes = require('./routes/relatorioRoutes');
const alertaRoutes = require('./routes/alertaRoutes');
const configuracaoRoutes = require('./routes/configuracaoRoutes');
const assinaturaRoutes = require('./routes/assinaturaRoutes');

const app = express();
const PORT = 3000;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

configurarSocket(io);

app.use(cors());
app.use(express.json());

app.use('/api/planos', planoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/maquinas', maquinaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/atividades', atividadeRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/relatorios', relatorioRoutes);
app.use('/api/alertas', alertaRoutes);
app.use('/api/configuracoes', configuracaoRoutes);
app.use('/api/assinatura', assinaturaRoutes);

io.on('connection', (socket) => {
    console.log('Cliente conectado ao WebSocket:', socket.id);

    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });
});

app.get('/', (req, res) => {
    res.json({
        message: 'API Argus funcionando!'
    });
});

app.get('/teste-db', async (req, res) => {
    try {
        const [resultado] = await pool.query('SELECT 1 AS conectado');

        res.json({
            message: 'Banco de dados conectado!',
            resultado
        });
    } catch (error) {
        console.error('Erro ao conectar com o banco:', error);

        res.status(500).json({
            message: 'Erro ao conectar com o banco de dados.'
        });
    }
});

server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});