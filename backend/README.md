# Backend API - WhatsApp Chat

API simples com Express + Prisma para o app de WhatsApp.

## Setup

1. Copie o `.env.example` para `.env`:
```bash
copy .env.example .env
```

2. Configure a DATABASE_URL no `.env` com a URL do Supabase:
   - Vá em Supabase Dashboard > Settings > Database > Connection string > URI

3. Configure a N8N_SEND_MESSAGE_URL com o webhook do n8n

4. Gere o cliente Prisma e sincronize o banco:
```bash
npm run db:generate
npm run db:push
```

5. Rode o servidor:
```bash
npm run dev
```

## Endpoints

- `GET /contacts` - Lista contatos com última mensagem
- `GET /contacts/:id/messages` - Mensagens de um contato
- `POST /messages` - Envia mensagem (body: { contactId, content })
- `GET /health` - Health check



