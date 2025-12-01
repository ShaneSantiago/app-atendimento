// ============================================
// 📱 SERVIÇO DO WHATSAPP (UAZAPI)
// ============================================

interface RespostaWhatsApp {
  success: boolean;
  data?: any;
  error?: any;
}

// Enviar mensagem para WhatsApp via UAZAPI
export async function enviarMensagemWhatsApp(
  telefone: string, 
  mensagem: string
): Promise<RespostaWhatsApp> {
  
  const token = process.env.UAZAPI_TOKEN;
  const url = process.env.UAZAPI_URL || 'https://api01vaiplhcombrcom.uazapi.com';

  // Verificar se o token está configurado
  if (!token) {
    console.error('❌ Token da UAZAPI não configurado!');
    return { 
      success: false, 
      error: 'Token da UAZAPI não configurado' 
    };
  }

  try {
    // Fazer requisição para UAZAPI
    const resposta = await fetch(`${url}/send/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': token
      },
      body: JSON.stringify({
        number: telefone,
        text: mensagem
      })
    });

    const dados = await resposta.json();

    // Verificar se deu erro
    if (!resposta.ok) {
      console.error('❌ Erro da UAZAPI:', dados);
      return { success: false, error: dados };
    }

    return { success: true, data: dados };

  } catch (error) {
    console.error('❌ Erro ao chamar UAZAPI:', error);
    return { success: false, error };
  }
}

