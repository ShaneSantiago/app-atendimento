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

// Listar conversas (baseado em mensagens, não apenas clientes)
export async function listarConversas(req: Request, res: Response) {
  try {
    // Busca todas as mensagens agrupadas por sender_id
    const mensagens = await prisma.message.findMany({
      orderBy: { id: 'desc' }
    });

    // Agrupa mensagens por sender_id
    const conversasMap = new Map<string, {
      phone: string;
      lastMessage: string;
      lastMessageAt: string;
      messageCount: number;
      name?: string;
    }>();

    for (const msg of mensagens) {
      if (!msg.sender_id) continue;
      
      if (!conversasMap.has(msg.sender_id)) {
        conversasMap.set(msg.sender_id, {
          phone: msg.sender_id,
          lastMessage: msg.message_text || '',
          lastMessageAt: msg.timestamp || new Date().toISOString(),
          messageCount: 1
        });
      } else {
        const conv = conversasMap.get(msg.sender_id)!;
        conv.messageCount++;
      }
    }

    // Busca clientes correspondentes para pegar os nomes
    const phones = Array.from(conversasMap.keys());
    const clientes = await prisma.client.findMany({
      where: { phone: { in: phones } }
    });

    // Monta lista de conversas
    const conversas = Array.from(conversasMap.values()).map(conv => {
      const cliente = clientes.find(c => c.phone === conv.phone);
      return {
        client_id: cliente?.client_id || conv.phone,
        phone: conv.phone,
        name: cliente?.name || conv.phone,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
        notific: cliente?.notific || 0,
        status: cliente?.status || 'unknown',
        messageCount: conv.messageCount
      };
    });

    // Ordena por última mensagem
    conversas.sort((a, b) => 
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );

    res.json(conversas);
  } catch (error) {
    console.error('❌ Erro ao buscar conversas:', error);
    res.status(500).json({ error: 'Erro ao buscar conversas' });
  }
}

