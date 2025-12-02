// ============================================
// 💬 ROTAS DE MENSAGENS
// ============================================

import { Router } from 'express';
import * as messageController from '../controllers/messageController';

const router = Router();

// GET /messages - Listar todas as mensagens
router.get('/', messageController.listarMensagens);

// GET /messages/:telefone - Buscar mensagens por telefone
router.get('/:telefone', messageController.buscarMensagensPorTelefone);

// POST /messages/send - Enviar mensagem para WhatsApp
router.post('/send', messageController.enviarMensagem);

export default router;

