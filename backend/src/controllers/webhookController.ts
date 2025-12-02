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
    console.log('📦 Body completo:', JSON.stringify(dados, null, 2));

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

    // 1. Criar ou atualizar cliente
    let cliente = await prisma.client.findFirst({
      where: { phone: telefone }
    });

    let isNovoCliente = false;

    if (!cliente) {
      console.log('👤 Criando novo cliente...');
      cliente = await prisma.client.create({
        data: {
          phone: telefone,
          name: nome || telefone,
          status: 'bot',
          notific: 1
        }
      });
      isNovoCliente = true;
      console.log('✅ Cliente criado:', cliente.client_id);
      
      // Emitir evento de novo cliente
      emitirParaTodos('novo-cliente', cliente);
    } else {
      // Incrementar contador de notificações
      cliente = await prisma.client.update({
        where: { client_id: cliente.client_id },
        data: { 
          notific: { increment: 1 },
          name: nome || cliente.name // Atualiza nome se vier
        }
      });
      
      // Emitir evento de cliente atualizado
      emitirParaTodos('cliente-atualizado', cliente);
    }

    // Extrair o número do bot (owner) da resposta
    const botNumber = msg.owner || dados.owner || process.env.BOT_NUMBER;

    // 2. Salvar mensagem no banco de dados
    // sender_id = quem enviou (cliente)
    // recipient_id = quem recebeu (bot)
    const mensagemSalva = await prisma.message.create({
      data: {
        sender_id: telefone,
        recipient_id: botNumber,
        message_text: texto
      }
    });

    // 3. Emitir para frontend via Socket.IO
    emitirParaTodos('nova-mensagem', {
      ...mensagemSalva,
      direction: 'incoming',
      senderName: nome,
      clientId: cliente.client_id
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
  const possiveisTelefones = [
    // Prioridade: chat.wa_chatid (formato UAZAPI)
    dados.chat?.wa_chatid,
    msg.chatid,
    dados.phone,
    msg.phone,
    msg.sender,
    msg.sender_pn,
    msg.from,
  ];

  for (const tel of possiveisTelefones) {
    if (typeof tel === 'string' && tel.trim()) {
      // Remove @s.whatsapp.net se existir
      return tel.replace('@s.whatsapp.net', '');
    }
  }

  return null;
}

function extrairTexto(msg: any, dados: any): string | null {
  // Tenta extrair texto de várias formas possíveis
  const possiveisTextos = [
    msg.text,
    msg.body,
    msg.content?.text,  // content pode ser objeto { text: "..." }
    msg.content,
    msg.message?.text,
    msg.message,
    dados.message?.text,
    dados.message,
    dados.text,
    dados.chat?.wa_lastMessageTextVote
  ];

  for (const texto of possiveisTextos) {
    if (typeof texto === 'string' && texto.trim()) {
      return texto;
    }
  }

  return null;
}

function extrairNome(msg: any, dados: any): string | null {
  return dados.name ||
         msg.name ||
         msg.senderName || 
         msg.pushName ||
         dados.chat?.name ||
         null;
}

