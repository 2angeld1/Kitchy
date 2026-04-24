import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketServer;

export const initSocket = (httpServer: HttpServer) => {
    io = new SocketServer(httpServer, {
        cors: {
            origin: '*', // En producción deberías restringir esto
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        const { negocioId } = socket.handshake.query;
        
        if (negocioId) {
            socket.join(`negocio_${negocioId}`);
            console.log(`📱 Cliente conectado al negocio: ${negocioId} (Socket ID: ${socket.id})`);
        }

        socket.on('disconnect', () => {
            console.log(`❌ Cliente desconectado (Socket ID: ${socket.id})`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io no ha sido inicializado');
    }
    return io;
};

export const emitToBusiness = (negocioId: string, event: string, data: any) => {
    if (io) {
        io.to(`negocio_${negocioId}`).emit(event, data);
    }
};
