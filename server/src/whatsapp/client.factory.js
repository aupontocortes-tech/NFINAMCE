import { makeWASocket, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import pino from 'pino';

/**
 * Factory para criar instâncias do socket Baileys.
 * Substitui o Puppeteer/Chrome por uma conexão WebSocket direta.
 */
export const createWhatsAppClient = async (auth) => {
  const { state, saveCreds } = auth;
  
  // Obtém a versão mais recente suportada para evitar banimentos/erros de protocolo
  const { version } = await fetchLatestBaileysVersion();
  
  console.log(`🛠️ Factory: Criando Socket Baileys (v${version.join('.')})`);

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }), // Logs detalhados apenas se necessário ('debug')
    printQRInTerminal: false, // O QR Code será enviado para o frontend
    auth: state,
    browser: ['NFinance', 'Chrome', '10.0.0'], // Identificação do cliente
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 10000,
    syncFullHistory: false, // Otimização: não sincronizar todo o histórico
  });

  // Vincula a persistência de credenciais (essencial para manter a sessão)
  sock.ev.on('creds.update', saveCreds);

  return sock;
};
