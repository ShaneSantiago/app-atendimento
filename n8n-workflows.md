# Workflows n8n - WhatsApp Business API

Você precisa criar 2 workflows no n8n para integrar com o app.

---

## Workflow 1: Receber Mensagens do WhatsApp

Este workflow recebe mensagens do WhatsApp via webhook e salva no Supabase.

### Nodes:

1. **Webhook** (Trigger)
   - Método: POST
   - Path: `/whatsapp-webhook`
   - Responder: Immediately

2. **IF** (Condicional)
   - Verificar se é uma mensagem válida:
   ```
   {{ $json.entry[0].changes[0].value.messages }}
   ```

3. **Code** (Extrair dados)
   ```javascript
   const entry = $input.first().json.entry[0];
   const change = entry.changes[0].value;
   const message = change.messages[0];
   const contact = change.contacts[0];

   return {
     phone: message.from,
     name: contact.profile?.name || null,
     content: message.text?.body || '[mídia]',
     whatsappId: message.id
   };
   ```

4. **Supabase** (Upsert Contact)
   - Operação: Upsert
   - Tabela: contacts
   - Campos:
     - phone: `{{ $json.phone }}`
     - name: `{{ $json.name }}`

5. **Supabase** (Get Contact ID)
   - Operação: Get Many
   - Tabela: contacts
   - Filtro: phone = `{{ $json.phone }}`

6. **Supabase** (Insert Message)
   - Operação: Insert
   - Tabela: messages
   - Campos:
     - contact_id: `{{ $json.id }}`
     - direction: `incoming`
     - content: `{{ $('Code').item.json.content }}`

---

## Workflow 2: Enviar Mensagens para o WhatsApp

Este workflow recebe chamadas do app e envia mensagens via API da Meta.

### Nodes:

1. **Webhook** (Trigger)
   - Método: POST
   - Path: `/send-message`
   - Responder: When last node finishes

2. **HTTP Request** (Enviar para Meta API)
   - Método: POST
   - URL: `https://graph.facebook.com/v18.0/{{PHONE_NUMBER_ID}}/messages`
   - Headers:
     - Authorization: `Bearer {{ACCESS_TOKEN}}`
     - Content-Type: `application/json`
   - Body (JSON):
   ```json
   {
     "messaging_product": "whatsapp",
     "to": "{{ $json.phone }}",
     "type": "text",
     "text": {
       "body": "{{ $json.message }}"
     }
   }
   ```

3. **Respond to Webhook**
   - Responder: `{ "success": true }`

---

## Configuração da Meta Cloud API

### 1. Criar App no Meta for Developers
- Acesse: https://developers.facebook.com/
- Criar novo app tipo "Business"
- Adicionar produto "WhatsApp"

### 2. Configurar Webhook
- Callback URL: `https://seu-n8n.com/webhook/whatsapp-webhook`
- Verify Token: (crie um token qualquer)
- Campos: `messages`

### 3. Obter Credenciais
- **Phone Number ID**: Na página do WhatsApp no Meta
- **Access Token**: 
  - Para testes: Use o token temporário
  - Para produção: Crie um System User no Business Manager

### 4. Testar
- Use o número de teste fornecido pela Meta
- Adicione seu número na lista de destinatários de teste

---

## Variáveis de Ambiente no n8n

Configure estas variáveis:
- `WHATSAPP_PHONE_ID`: ID do número de telefone
- `WHATSAPP_TOKEN`: Access Token da Meta
- `SUPABASE_URL`: URL do projeto Supabase
- `SUPABASE_KEY`: API Key do Supabase


