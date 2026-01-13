import { Client } from 'whatsapp-web.js';
import { config } from '../config/env.js';

/**
 * Factory para criar instâncias do cliente WhatsApp.
 * Centraliza as configurações do Puppeteer para garantir compatibilidade com o Render.
 */
export const createWhatsAppClient = (clientId, authStrategy) => {
  console.log(`🛠️ Factory: Criando nova instância do WhatsApp Client para [${clientId}]`);
  
  return new Client({
    authStrategy: authStrategy,
    puppeteer: {
      headless: true,
      args: config.puppeteer.args,
      executablePath: config.puppeteer.executablePath,
      timeout: 60000, // Timeout aumentado para evitar falhas no boot
    }
  });
};
