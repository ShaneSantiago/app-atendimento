// ============================================
// 👥 ROTAS DE CLIENTES
// ============================================

import { Router } from 'express';
import * as clientController from '../controllers/clientController';

const router = Router();

// GET /clients - Listar todos os clientes
router.get('/', clientController.listarClientes);

// GET /clients/conversations - Listar conversas baseadas em mensagens
router.get('/conversations', clientController.listarConversas);

// GET /clients/:id - Buscar cliente por ID
router.get('/:id', clientController.buscarCliente);

// GET /clients/telefone/:telefone - Buscar cliente por telefone
router.get('/telefone/:telefone', clientController.buscarClientePorTelefone);

export default router;

