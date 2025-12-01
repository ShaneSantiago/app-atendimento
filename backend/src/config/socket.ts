// ============================================
// 🔌 CONFIGURAÇÃO DO SOCKET.IO
// ============================================

import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: Server;

// Inicializa o Socket.IO
export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 Cliente conectado:', socket.id);
    
    socket.on('disconnect', () => {
      console.log('❌ Cliente desconectado:', socket.id);
    });
  });

  return io;
}

// Envia mensagem para todos os clientes conectados
export function emitirParaTodos(evento: string, dados: any) {
  if (io) {
    io.emit(evento, dados);
  }
}

export { io };

