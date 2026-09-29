let io;

function configurarSocket(socketServer) {
    io = socketServer;
}

function emitirEvento(evento, dados) {
    if (io) {
        io.emit(evento, dados);
    }
}

module.exports = {
    configurarSocket,
    emitirEvento
};