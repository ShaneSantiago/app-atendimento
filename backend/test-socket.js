// ============================================
// 🧪 TESTE DO SOCKET.IO - TEMPO REAL
// ============================================
// 
// Este script conecta no servidor e mostra
// as mensagens que chegam em tempo real.
//
// Execute com: node test-socket.js
//
// ============================================

const { io } = require('socket.io-client');

// Conectar no servidor
const socket = io('http://localhost:3000');

console.log('');
console.log('============================================');
console.log('🔄 Conectando ao servidor...');
console.log('============================================');

// Quando conectar
socket.on('connect', () => {
  console.log('');
  console.log('✅ Conectado! ID:', socket.id);
  console.log('');
  console.log('📡 Aguardando mensagens em tempo real...');
  console.log('');
  console.log('💡 Para testar:');
  console.log('   1. Envie uma mensagem via POST /send-message');
  console.log('   2. Ou responda pelo WhatsApp');
  console.log('');
  console.log('Pressione Ctrl+C para sair.');
  console.log('============================================');
  console.log('');
});

// Quando receber nova mensagem
socket.on('nova-mensagem', (mensagem) => {
  console.log('🎉 ========== NOVA MENSAGEM! ==========');
  console.log('');
  
  if (mensagem.direction === 'incoming') {
    console.log('   📥 RECEBIDA do WhatsApp');
  } else {
    console.log('   📤 ENVIADA para WhatsApp');
  }
  
  console.log('');
  console.log('   📱 Telefone:', mensagem.sender_id);
  console.log('   💬 Texto:', mensagem.message_text);
  
  if (mensagem.senderName) {
    console.log('   👤 Nome:', mensagem.senderName);
  }
  
  console.log('   🕐 Horário:', mensagem.timestamp);
  console.log('');
  console.log('=======================================');
  console.log('');
});

// Quando desconectar
socket.on('disconnect', () => {
  console.log('❌ Desconectado do servidor');
});

// Quando der erro
socket.on('connect_error', (error) => {
  console.log('❌ Erro de conexão:', error.message);
  console.log('');
  console.log('💡 Verifique se o servidor está rodando:');
  console.log('   npm run dev');
});
