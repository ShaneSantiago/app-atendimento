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

// Buscar mensagens por telefone (conversa completa)
export async function buscarMensagensPorTelefone(req: Request, res: Response) {
  try {
    const { telefone } = req.params;
    
    // Normaliza o telefone removendo caracteres não numéricos
    const telefoneNormalizado = telefone.replace(/\D/g, '');
    
    // Busca mensagens onde o telefone é sender (cliente enviou) OU recipient (cliente recebeu)
    const mensagens = await prisma.message.findMany({
      where: {
        OR: [
          // Cliente enviou (sender_id = cliente)
          { sender_id: telefone },
          { sender_id: telefoneNormalizado },
          { sender_id: { contains: telefoneNormalizado } },
          // Cliente recebeu (recipient_id = cliente)
          { recipient_id: telefone },
          { recipient_id: telefoneNormalizado },
          { recipient_id: { contains: telefoneNormalizado } },
        ]
      },
      orderBy: { timestamp: 'asc' }
    });

    // Adiciona campo direction para facilitar no frontend
    const mensagensComDirection = mensagens.map(msg => ({
      ...msg,
      direction: msg.recipient_id === telefone || msg.recipient_id === telefoneNormalizado || msg.recipient_id?.includes(telefoneNormalizado) 
        ? 'outgoing'  // bot enviou para cliente
        : 'incoming'  // cliente enviou para bot
    }));

    res.json(mensagensComDirection);
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

    // Extrair o número do bot (owner) da resposta
    const botNumber = respostaWhatsApp.data?.owner || respostaWhatsApp.data?.sender?.replace('@s.whatsapp.net', '') || process.env.BOT_NUMBER;

    // 2. Salvar no banco de dados
    // sender_id = quem enviou (bot)
    // recipient_id = quem recebeu (cliente)
    const mensagemSalva = await prisma.message.create({
      data: {
        sender_id: botNumber,
        recipient_id: phone,
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

