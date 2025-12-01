import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// GET /contacts - Lista todos os contatos com última mensagem
app.get('/contacts', async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const result = contacts.map(contact => ({
      id: contact.id,
      phone: contact.phone,
      name: contact.name,
      profilePic: contact.profilePic,
      lastMessage: contact.messages[0]?.content || null,
      lastMessageAt: contact.messages[0]?.createdAt || contact.createdAt
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar contatos' });
  }
});

// GET /contacts/:id/messages - Busca mensagens de um contato
app.get('/contacts/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    
    const messages = await prisma.message.findMany({
      where: { contactId: id },
      orderBy: { createdAt: 'asc' }
    });

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
});

// POST /messages - Envia uma mensagem (chama n8n e salva no banco)
app.post('/messages', async (req, res) => {
  try {
    const { contactId, content } = req.body;

    // Buscar o contato para pegar o telefone
    const contact = await prisma.contact.findUnique({
      where: { id: contactId }
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contato não encontrado' });
    }

    // Chamar o n8n para enviar a mensagem via WhatsApp
    const n8nUrl = process.env.N8N_SEND_MESSAGE_URL;
    if (n8nUrl) {
      await fetch(n8nUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: contact.phone,
          message: content
        })
      });
    }

    // Salvar a mensagem no banco
    const message = await prisma.message.create({
      data: {
        contactId,
        content,
        direction: 'outgoing'
      }
    });

    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`);
});

