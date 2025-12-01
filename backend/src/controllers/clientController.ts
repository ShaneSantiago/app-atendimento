// ============================================
// 👥 CONTROLLER DE CLIENTES
// ============================================

import { Request, Response } from 'express';
import prisma from '../config/database';

// Listar todos os clientes
export async function listarClientes(req: Request, res: Response) {
  try {
    const clientes = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(clientes);
  } catch (error) {
    console.error('❌ Erro ao buscar clientes:', error);
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
}

// Buscar cliente por ID
export async function buscarCliente(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const cliente = await prisma.client.findUnique({
      where: { client_id: id }
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json(cliente);
  } catch (error) {
    console.error('❌ Erro ao buscar cliente:', error);
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
}

// Buscar cliente por telefone
export async function buscarClientePorTelefone(req: Request, res: Response) {
  try {
    const { telefone } = req.params;
    
    const cliente = await prisma.client.findFirst({
      where: { phone: telefone }
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json(cliente);
  } catch (error) {
    console.error('❌ Erro ao buscar cliente:', error);
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
}

