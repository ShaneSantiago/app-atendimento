# WhatsApp Multiatendimento App

App React Native para visualizar e responder mensagens do WhatsApp Business.

## Arquitetura

```
[WhatsApp] ←→ [Meta Cloud API] ←→ [n8n Webhook]
                                        ↓
[App React Native] ←→ [Backend API] ←→ [Supabase/PostgreSQL]
        ↓                                    ↑
[Enviar msg] → [n8n] → [Meta API] ──────────┘
```

## Estrutura do Projeto

```
├── backend/           # API Express + Prisma
│   ├── src/
│   │   └── index.ts   # Servidor com endpoints
│   └── prisma/
│       └── schema.prisma
├── whatsapp-app/      # App React Native (Expo)
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   └── services/
│   └── App.tsx
├── supabase-schema.sql  # Schema do banco
└── n8n-workflows.md     # Documentação dos workflows
```

## Setup

### 1. Banco de Dados (Supabase)

1. Crie um projeto no [Supabase](https://supabase.com)
2. Vá em Settings > Database > Connection string
3. Copie a URI para usar no backend

### 2. Backend

```bash
cd backend
copy .env.example .env
# Edite o .env com suas configurações

npm run db:generate
npm run db:push
npm run dev
```

### 3. App React Native

```bash
cd whatsapp-app
# Edite src/services/api.ts com o IP do seu backend
npm start
```

Escaneie o QR code com o Expo Go.

### 4. n8n

Configure os workflows conforme documentado em `n8n-workflows.md`.

## Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/contacts` | Lista contatos com última mensagem |
| GET | `/contacts/:id/messages` | Mensagens de um contato |
| POST | `/messages` | Envia mensagem |
| GET | `/health` | Health check |

## Tecnologias

- **App**: React Native + Expo + TypeScript
- **Backend**: Express + Prisma + TypeScript
- **Banco**: PostgreSQL (Supabase)
- **Automação**: n8n
- **API**: Meta WhatsApp Cloud API


# app-atendimento

