// ============================================
// 🔌 CONFIGURAÇÃO DO SOCKET.IO
// ============================================

import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: Server;

// Inicializa o Socket.IO
export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket: Socket) => {
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
    console.log(`🔌 Emitindo evento "${evento}" para ${io.engine.clientsCount} cliente(s)`);
    console.log('📤 Dados:', JSON.stringify(dados, null, 2));
    io.emit(evento, dados);
  } else {
    console.log('⚠️ Socket.IO não inicializado!');
  }
}

export { io };

