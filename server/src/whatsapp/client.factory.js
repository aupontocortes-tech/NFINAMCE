import pkg from 'whatsapp-web.js';
const { Client } = pkg;
import { config } from '../config/env.js';

/**
 * Factory para criar instâncias do cliente WhatsApp.
 * Centraliza as configurações do Puppeteer para garantir compatibilidade com o Render.
 */
export const createWhatsAppClient = (clientId, authStrategy) => {
  console.log(`🛠️ Factory: Criando nova instância do WhatsApp Client para [${clientId}]`);
  
  return new Client({
    authStrategy: authStrategy,
    // Bloqueia a versão do WhatsApp Web para evitar quebras com atualizações automáticas
    webVersionCache: {
      type: 'remote',
      remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
    },
    puppeteer: {
      headless: true, // Tente 'new' se estiver usando Puppeteer > 19, mas true é seguro
      executablePath: config.puppeteer.executablePath,
      timeout: 120000, // Timeout aumentado drasticamente para o Render (2min)
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process', // Importante para ambientes com pouca memória
        '--disable-gpu'
      ]
    }
  });
};
