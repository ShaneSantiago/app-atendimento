// ============================================
// 📋 ÍNDICE DE ROTAS
// ============================================

import { Router } from 'express';
import clientRoutes from './clientRoutes';

const router = Router();

// Registrar rotas
router.use('/clients', clientRoutes);

export default router;

