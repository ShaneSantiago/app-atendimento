// ============================================
// 🗄️ CONFIGURAÇÃO DO BANCO DE DADOS
// ============================================

import { PrismaClient } from '@prisma/client';

// Instância única do Prisma (Singleton)
const prisma = new PrismaClient();

export default prisma;

