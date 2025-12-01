// ============================================
// 💬 CONTROLLER DE MENSAGENS
// ============================================

import { Request, Response } from 'express';
import prisma from '../config/database';
import { emitirParaTodos } from '../config/socket';
import { enviarMensagemWhatsApp } from '../services/whatsappService';

// Listar todas as mensagens
export async function listarMensagens(req: Request, res: Response) {
  try {
    const mensagens = await prisma.message.findMany({
      orderBy: { id: 'desc' }
    });
    
    res.json(mensagens);
  } catch (error) {
    console.error('❌ Erro ao buscar mensagens:', error);
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
}

// Buscar mensagens por telefone
export async function buscarMensagensPorTelefone(req: Request, res: Response) {
  try {
    const { telefone } = req.params;
    
    // Normaliza o telefone removendo caracteres não numéricos
    const telefoneNormalizado = telefone.replace(/\D/g, '');
    
    // Busca mensagens que contenham o telefone (flexível)
    const mensagens = await prisma.message.findMany({
      where: {
        OR: [
          { sender_id: telefone },
          { sender_id: telefoneNormalizado },
          { sender_id: { contains: telefoneNormalizado } },
        ]
      },
      orderBy: { id: 'asc' }
    });

    res.json(mensagens);
  } catch (error) {
    console.error('❌ Erro ao buscar mensagens:', error);
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
}

// Enviar mensagem para WhatsApp
export async function enviarMensagem(req: Request, res: Response) {
  try {
    const { phone, message } = req.body;

    // Validar dados
    if (!phone || !message) {
      return res.status(400).json({ error: 'Telefone e mensagem são obrigatórios' });
    }

    console.log('📤 Enviando mensagem para:', phone);

    // 1. Enviar para WhatsApp via UAZAPI
    const respostaWhatsApp = await enviarMensagemWhatsApp(phone, message);

    if (!respostaWhatsApp.success) {
      return res.status(500).json({ 
        error: 'Erro ao enviar para WhatsApp', 
        details: respostaWhatsApp.error 
      });
    }

    // 2. Salvar no banco de dados
    const mensagemSalva = await prisma.message.create({
      data: {
        sender_id: phone,
        message_text: message
      }
    });

    // 3. Emitir para frontend via Socket.IO
    emitirParaTodos('nova-mensagem', {
      ...mensagemSalva,
      direction: 'outgoing'
    });

    console.log('✅ Mensagem enviada com sucesso!');
    
    res.json({ 
      success: true, 
      mensagem: mensagemSalva,
      whatsapp: respostaWhatsApp.data
    });

  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
}

