import { LocalSessionRepository } from './session.repository.js';
import { createWhatsAppClient } from './client.factory.js';
import { randomDelay } from '../utils/delay.js';

class WhatsAppSessionService {
  constructor(repository) {
    this.repository = repository;
    this.clients = new Map(); // userId -> Client
    this.qrCodes = new Map(); // userId -> Raw QR String
    this.statuses = new Map(); // userId -> 'INITIALIZING' | 'QR_READY' | 'READY' | 'DISCONNECTED' | 'ERROR'
  }

  /**
   * Inicia uma sessão do WhatsApp para um userId específico.
   * Se já existir, retorna o status atual, a menos que force=true.
   */
  async startSession(userId, force = false) {
    // Se já existe e não é forçado, verifica se está saudável
    if (this.clients.has(userId) && !force) {
      const status = this.statuses.get(userId);
      
      // Se estiver travado em ERROR ou DISCONNECTED, força reinício automaticamente
      if (status === 'ERROR' || status === 'DISCONNECTED') {
        console.log(`Sessão ${userId} está em ${status}. Forçando reinício...`);
        await this.disconnect(userId); // Garante limpeza
      } else {
        console.log(`Sessão para ${userId} já existe. Status: ${status}`);
        return { status, qrCode: this.qrCodes.get(userId) };
      }
    } else if (this.clients.has(userId) && force) {
      console.log(`Reinício forçado solicitado para ${userId}.`);
      await this.disconnect(userId);
    }

    this.updateStatus(userId, 'INITIALIZING');
    console.log(`Iniciando nova sessão para: ${userId}`);

    try {
      const authStrategy = this.repository.getAuthStrategy(userId);
      const client = createWhatsAppClient(userId, authStrategy);

      this.setupEvents(client, userId);
      
      // Inicializa sem bloquear a resposta da API imediatamente
      client.initialize().catch(err => {
        console.error(`Erro fatal na inicialização do cliente ${userId}:`, err);
        this.updateStatus(userId, 'ERROR');
        this.clients.delete(userId);
      });

      this.clients.set(userId, client);
      return { status: 'INITIALIZING', message: 'Inicialização iniciada' };

    } catch (error) {
      console.error(`Falha ao configurar sessão ${userId}:`, error);
      this.updateStatus(userId, 'ERROR');
      throw error;
    }
  }

  /**
   * Configura os event listeners do cliente WhatsApp.
   */
  setupEvents(client, userId) {
    client.on('qr', (qr) => {
      console.log(`⚡ QR Code recebido para ${userId}`);
      // Armazena o código QR bruto para o frontend gerar o SVG
      this.qrCodes.set(userId, qr);
      this.updateStatus(userId, 'QR_READY');
    });

    client.on('ready', () => {
      console.log(`✅ Sessão ${userId} está PRONTA para uso!`);
      this.updateStatus(userId, 'READY');
      this.qrCodes.delete(userId); // Remove o QR Code pois não é mais necessário
    });

    client.on('authenticated', () => {
      console.log(`🔐 Sessão ${userId} autenticada com sucesso.`);
      this.qrCodes.delete(userId); // Remove QR Code assim que autenticar
    });

    client.on('auth_failure', (msg) => {
      console.error(`❌ Falha de autenticação para ${userId}:`, msg);
      this.updateStatus(userId, 'ERROR');
    });

    client.on('disconnected', (reason) => {
      console.log(`⚠️ Sessão ${userId} desconectada: ${reason}`);
      this.updateStatus(userId, 'DISCONNECTED');
      this.clients.delete(userId);
      this.qrCodes.delete(userId);
      
      // Lógica opcional de reconexão automática poderia entrar aqui
      // Por enquanto, deixamos desconectado para evitar loops infinitos no Render
    });
  }

  /**
   * Retorna o status atual e o QR Code (se houver) da sessão.
   */
  getStatus(userId) {
    return {
      status: this.statuses.get(userId) || 'DISCONNECTED',
      qrCode: this.qrCodes.get(userId) || null
    };
  }

  /**
   * Envia uma mensagem com controle de antiflood (delay aleatório).
   */
  async sendMessage(userId, phoneNumber, message) {
    const client = this.clients.get(userId);
    const status = this.statuses.get(userId);

    if (!client || status !== 'READY') {
      throw new Error(`Sessão não está pronta. Status atual: ${status || 'INEXISTENTE'}`);
    }

    // Formata o número para o padrão do whatsapp-web.js (apenas números + @c.us)
    const formattedNumber = phoneNumber.replace(/\D/g, '') + '@c.us';

    // Aplica um delay aleatório (2s a 5s) para simular comportamento humano (Antiflood)
    console.log(`⏳ Aguardando delay antiflood para enviar mensagem para ${phoneNumber}...`);
    await randomDelay(2000, 5000);

    try {
      await client.sendMessage(formattedNumber, message);
      console.log(`📤 Mensagem enviada para ${phoneNumber} via sessão ${userId}`);
      return { success: true };
    } catch (error) {
      console.error(`Erro ao enviar mensagem para ${phoneNumber}:`, error);
      throw error;
    }
  }

  /**
   * Atualiza o status de uma sessão.
   */
  updateStatus(userId, status) {
    this.statuses.set(userId, status);
  }
  
  /**
   * Método para desconectar manualmente
   */
  async disconnect(userId) {
      const client = this.clients.get(userId);
      if (client) {
          await client.destroy();
          this.clients.delete(userId);
          this.statuses.set(userId, 'DISCONNECTED');
          this.qrCodes.delete(userId);
          return true;
      }
      return false;
  }
}

// Singleton: Exporta uma única instância do serviço
export const sessionService = new WhatsAppSessionService(new LocalSessionRepository());
