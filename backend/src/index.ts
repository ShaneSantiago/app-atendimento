// ============================================
// 🚀 APP DE ATENDIMENTO - BACKEND
// ============================================
//
// Estrutura do projeto:
//
// src/
// ├── index.ts              ← Arquivo principal (você está aqui)
// ├── config/
// │   ├── database.ts       ← Conexão com banco (Prisma)
// │   └── socket.ts         ← Configuração Socket.IO
// ├── controllers/
// │   ├── clientController.ts    ← Lógica de clientes
// │   ├── messageController.ts   ← Lógica de mensagens
// │   └── webhookController.ts   ← Lógica do webhook
// ├── routes/
// │   ├── index.ts          ← Índice de rotas
// │   ├── clientRoutes.ts   ← Rotas de clientes
// │   ├── messageRoutes.ts  ← Rotas de mensagens
// │   └── webhookRoutes.ts  ← Rotas do webhook
// └── services/
//     └── whatsappService.ts ← Integração com UAZAPI
//
// ============================================

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import dotenv from 'dotenv';

// Configurações
import { initSocket } from './config/socket';

// Rotas
import routes from './routes';

// Carregar variáveis de ambiente
dotenv.config();

// ============================================
// ⚙️ INICIALIZAÇÃO
// ============================================

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// Inicializar Socket.IO
initSocket(httpServer);

// ============================================
// 🔧 MIDDLEWARES
// ============================================

app.use(cors());
app.use(express.json());

// ============================================
// 📋 ROTAS
// ============================================

// Registrar todas as rotas
app.use(routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Servidor funcionando!',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// 🚀 INICIAR SERVIDOR
// ============================================

httpServer.listen(PORT, () => {
  console.log('');
  console.log('============================================');
  console.log('🚀 SERVIDOR INICIADO!');
  console.log('============================================');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🔌 Socket.IO: Ativo`);
  console.log('');
  console.log('📋 Rotas disponíveis:');
  console.log('');
  console.log('   👥 CLIENTES:');
  console.log('   GET  /clients              - Lista todos');
  console.log('   GET  /clients/:id          - Busca por ID');
  console.log('   GET  /clients/telefone/:t  - Busca por telefone');
  console.log('');
  console.log('   💬 MENSAGENS:');
  console.log('   GET  /messages             - Lista todas');
  console.log('   GET  /messages/:telefone   - Busca por telefone');
  console.log('   POST /messages/send        - Envia para WhatsApp');
  console.log('');
  console.log('   📥 WEBHOOK:');
  console.log('   POST /webhook              - Recebe do WhatsApp');
  console.log('');
  console.log('   ❤️ HEALTH:');
  console.log('   GET  /health               - Status do servidor');
  console.log('');
  console.log('============================================');
  console.log('');
});
