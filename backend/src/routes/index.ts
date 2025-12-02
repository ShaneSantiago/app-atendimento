// ============================================
// 📋 ÍNDICE DE ROTAS
// ============================================

import { Router } from 'express';
import clientRoutes from './clientRoutes';
import messageRoutes from './messageRoutes';
import webhookRoutes from './webhookRoutes';

const router = Router();

// Registrar rotas
router.use('/clients', clientRoutes);
router.use('/messages', messageRoutes);
router.use('/webhook', webhookRoutes);

export default router;

