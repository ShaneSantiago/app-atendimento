// ============================================
// 📥 ROTAS DO WEBHOOK
// ============================================

import { Router } from 'express';
import * as webhookController from '../controllers/webhookController';

const router = Router();

// POST /webhook - Receber mensagens do WhatsApp (UAZAPI)
router.post('/', webhookController.receberWebhook);

export default router;

