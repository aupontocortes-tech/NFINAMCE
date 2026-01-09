import qrcodeTerminal from 'qrcode-terminal';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;

// Estado Global do WhatsApp
let qrCodeData = null;
let connectionStatus = 'DISCONNECTED'; // DISCONNECTED, INITIALIZING, QR_READY, CONNECTED
let sessionInfo = null;

const client = new Client({
  authStrategy: new LocalAuth(), // Salva sessão para não precisar escanear sempre
  puppeteer: {
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ],
    headless: true,
    timeout: 60000 // 60 segundos
  }
});

// Eventos do Cliente
client.on('qr', (qr) => {
  console.log('📱 QR CODE Gerado! Aguardando leitura...');
  qrCodeData = qr;
  connectionStatus = 'QR_READY';
  qrcodeTerminal.generate(qr, { small: true });
});

client.on('loading_screen', (percent, message) => {
  console.log('⏳ Carregando WhatsApp...', percent, '%');
  connectionStatus = 'INITIALIZING';
});

client.on('authenticated', () => {
  console.log('🔐 WhatsApp Autenticado!');
  connectionStatus = 'INITIALIZING';
});

client.on('auth_failure', (msg) => {
  console.error('❌ Falha na autenticação:', msg);
  connectionStatus = 'DISCONNECTED';
});

client.on('ready', () => {
  console.log('✅ WhatsApp Conectado e Pronto!');
  connectionStatus = 'CONNECTED';
  qrCodeData = null;
  
  // Tenta obter info do usuário
  try {
    sessionInfo = {
      user: client.info.wid.user,
      pushname: client.info.pushname,
      platform: client.info.platform,
      connectedAt: new Date().toISOString()
    };
    console.log(`👤 Conectado como: ${sessionInfo.user}`);
  } catch (e) {
    console.error('Erro ao obter info do usuário:', e);
  }
});

client.on('disconnected', (reason) => {
  console.log('❌ WhatsApp Desconectado:', reason);
  connectionStatus = 'DISCONNECTED';
  qrCodeData = null;
  sessionInfo = null;
  
  // Reinicia o cliente para ficar pronto para novo QR Code
  // Mas espera um pouco para evitar loops rápidos
  setTimeout(() => {
    client.initialize();
  }, 5000);
});

// Inicialização
console.log('🔄 Inicializando serviço do WhatsApp...');
client.initialize();

// --- Métodos Exportados ---

export const getStatus = () => ({
  status: connectionStatus,
  qrCode: qrCodeData,
  session: sessionInfo
});

export const desconectarWhatsApp = async () => {
  if (connectionStatus === 'CONNECTED') {
    try {
      await client.logout();
      return true;
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      return false;
    }
  }
  return false;
};

export const enviarMensagem = async (numero, texto) => {
  if (connectionStatus !== 'CONNECTED') {
    throw new Error('WhatsApp não está conectado.');
  }

  // Formatação básica do número
  // Assumindo que o número já venha com 55 e DDD (ex: 5511999999999)
  const limpo = numero.replace(/\D/g, '');
  const chatId = limpo.includes('@c.us') ? limpo : `${limpo}@c.us`;

  try {
    await client.sendMessage(chatId, texto);
    console.log(`📤 Mensagem enviada para ${limpo}`);
    return true;
  } catch (error) {
    console.error(`Erro ao enviar mensagem para ${numero}:`, error);
    throw error;
  }
};

export const enviarMensagemWhatsApp = async (aluno, mensagem) => {
  if (connectionStatus !== 'CONNECTED') {
    console.warn(`🚫 BLOQUEADO: Tentativa de enviar para ${aluno.nome}, mas WhatsApp não está conectado.`);
    return false;
  }

  if (!aluno.telefone) {
    console.error(`⚠️ Aluno ${aluno.nome} sem telefone.`);
    return false;
  }
  
  const cleanPhone = aluno.telefone.replace(/\D/g, '');
  const chatId = `${cleanPhone}@c.us`;
  
  try {
    await client.sendMessage(chatId, mensagem);
    console.log(`📨 Mensagem enviada para ${aluno.nome} (${cleanPhone})`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao enviar mensagem para ${aluno.nome}:`, error);
    return false;
  }
};
