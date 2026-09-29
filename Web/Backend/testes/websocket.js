const { io } = require('socket.io-client');

const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('Conectado ao WebSocket!');
    console.log('ID do socket:', socket.id);
});

socket.on('maquina:status', (dados) => {
    console.log('Evento recebido:');
    console.log(dados);
});

socket.on('disconnect', () => {
    console.log('Desconectado do WebSocket.');
});

socket.on('connect_error', (error) => {
    console.error('Erro ao conectar:', error.message);
});