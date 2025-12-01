// ============================================
// 📥 CONTROLLER DO WEBHOOK (UAZAPI)
// ============================================

import { Request, Response } from 'express';
import prisma from '../config/database';
import { emitirParaTodos } from '../config/socket';

// Receber mensagem do WhatsApp via UAZAPI
export async function receberWebhook(req: Request, res: Response) {
  try {
    const dados = req.body;
    const msg = dados.message || dados;

    console.log('📥 Webhook recebido da UAZAPI');

    // Ignorar mensagens que EU enviei
    if (msg.fromMe) {
      return res.json({ success: true, ignored: true });
    }

    // Extrair informações da mensagem
    const telefone = extrairTelefone(msg, dados);
    const texto = extrairTexto(msg, dados);
    const nome = extrairNome(msg, dados);
    const messageId = msg.messageid || msg.id;

    // Validar dados
    if (!telefone || !texto) {
      console.log('⚠️ Dados incompletos, ignorando...');
      return res.json({ success: true, ignored: true });
    }

    console.log('📱 De:', telefone);
    console.log('👤 Nome:', nome);
    console.log('💬 Mensagem:', texto);

    // 1. Salvar no banco de dados
    const mensagemSalva = await prisma.message.create({
      data: {
        message_id: messageId,
        sender_id: telefone,
        message_text: texto
      }
    });

    // 2. Emitir para frontend via Socket.IO
    emitirParaTodos('nova-mensagem', {
      ...mensagemSalva,
      direction: 'incoming',
      senderName: nome
    });

    console.log('✅ Mensagem recebida e salva!');
    
    res.json({ success: true, mensagem: mensagemSalva });

  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    res.status(500).json({ error: 'Erro ao processar webhook' });
  }
}

// ============================================
// 🔧 FUNÇÕES AUXILIARES
// ============================================

function extrairTelefone(msg: any, dados: any): string | null {
  return msg.sender_pn?.replace('@s.whatsapp.net', '') || 
         msg.chatid?.replace('@s.whatsapp.net', '') ||
         dados.chat?.wa_chatid?.replace('@s.whatsapp.net', '') ||
         null;
}

function extrairTexto(msg: any, dados: any): string | null {
  return msg.text || 
         msg.content || 
         dados.chat?.wa_lastMessageTextVote ||
         null;
}

function extrairNome(msg: any, dados: any): string | null {
  return msg.senderName || 
         dados.chat?.name ||
         null;
}

