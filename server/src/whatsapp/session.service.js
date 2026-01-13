import fs from 'fs';
import path from 'path';
import { LocalSessionRepository } from './session.repository.js';
import { createWhatsAppClient } from './client.factory.js';
import { randomDelay } from '../utils/delay.js';

class WhatsAppSessionService {
  constructor(repository) {
    this.repository = repository;
    this.clients = new Map(); // userId -> Client
    this.qrCodes = new Map(); // userId -> Raw QR String
    this.statuses = new Map(); // userId -> 'INITIALIZING' | 'QR_READY' | 'READY' | 'DISCONNECTED' | 'ERROR'
    this.logs = []; // Logs internos para debug
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    console.log(entry); // Mantém no console do servidor
    this.logs.unshift(entry); // Adiciona no início da lista
    if (this.logs.length > 50) this.logs.pop(); // Mantém apenas os últimos 50 logs
  }

  getLogs() {
    return this.logs;
  }

  /**
   * Inicia uma sessão do WhatsApp para um userId específico.
   * Se já existir, retorna o status atual, a menos que force=true.
   */
  async startSession(userId, force = false) {
    this.log(`Solicitação de início de sessão para ${userId} (force=${force})`);

    // Se já existe e não é forçado, verifica se está saudável
    if (this.clients.has(userId) && !force) {
      const status = this.statuses.get(userId);
      
      // Se estiver travado em ERROR ou DISCONNECTED, força reinício automaticamente
      if (status === 'ERROR' || status === 'DISCONNECTED') {
        this.log(`Sessão ${userId} está em ${status}. Forçando reinício...`, 'warn');
        await this.disconnect(userId); // Garante limpeza
      } else {
        this.log(`Sessão para ${userId} já existe. Status: ${status}`);
        return { status, qrCode: this.qrCodes.get(userId) };
      }
    } else if (this.clients.has(userId) && force) {
      this.log(`Reinício forçado solicitado para ${userId}.`, 'warn');
      await this.disconnect(userId);
    }

    this.updateStatus(userId, 'INITIALIZING');
    this.log(`Iniciando nova sessão para: ${userId}`);

    try {
      const authStrategy = this.repository.getAuthStrategy(userId);
      const client = createWhatsAppClient(userId, authStrategy);

      this.setupEvents(client, userId);
      
      // Inicializa sem bloquear a resposta da API imediatamente
      this.log(`Chamando client.initialize() para ${userId}...`);
      client.initialize().catch(err => {
        this.log(`Erro fatal na inicialização do cliente ${userId}: ${err.message}`, 'error');
        this.updateStatus(userId, 'ERROR');
        this.clients.delete(userId);
      });

      this.clients.set(userId, client);
      return { status: 'INITIALIZING', message: 'Inicialização iniciada' };

    } catch (error) {
      this.log(`Falha ao configurar sessão ${userId}: ${error.message}`, 'error');
      this.updateStatus(userId, 'ERROR');
      throw error;
    }
  }

  /**
   * Configura os event listeners do cliente WhatsApp.
   */
  setupEvents(client, userId) {
    client.on('qr', (qr) => {
      this.log(`⚡ QR Code recebido para ${userId}`);
      // Armazena o código QR bruto para o frontend gerar o SVG
      this.qrCodes.set(userId, qr);
      this.updateStatus(userId, 'QR_READY');
    });

    client.on('ready', () => {
      this.log(`✅ Sessão ${userId} está PRONTA para uso!`);
      this.updateStatus(userId, 'READY');
      this.qrCodes.delete(userId); // Remove o QR Code pois não é mais necessário
    });

    client.on('authenticated', () => {
      this.log(`🔐 Sessão ${userId} autenticada com sucesso.`);
      this.qrCodes.delete(userId); // Remove QR Code assim que autenticar
    });

    client.on('auth_failure', (msg) => {
      this.log(`❌ Falha de autenticação para ${userId}: ${msg}`, 'error');
      this.updateStatus(userId, 'ERROR');
    });

    client.on('disconnected', (reason) => {
      this.log(`⚠️ Sessão ${userId} desconectada: ${reason}`, 'warn');
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
    this.log(`⏳ Aguardando delay antiflood para enviar mensagem para ${phoneNumber}...`);
    await randomDelay(2000, 5000);

    try {
      await client.sendMessage(formattedNumber, message);
      this.log(`📤 Mensagem enviada para ${phoneNumber} via sessão ${userId}`);
      return { success: true };
    } catch (error) {
      this.log(`Erro ao enviar mensagem para ${phoneNumber}: ${error.message}`, 'error');
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
   * Método para desconectar manualmente e limpar arquivos
   */
  async disconnect(userId) {
      const client = this.clients.get(userId);
      this.log(`Desconectando sessão ${userId}...`);
      
      if (client) {
          try {
            await client.destroy();
          } catch (e) {
            this.log(`Erro ao destruir cliente: ${e.message}`, 'error');
          }
          this.clients.delete(userId);
      }
      
      // Limpeza física dos arquivos de autenticação (.wwebjs_auth)
      // Isso é crucial para corrigir loops de "corrupted session" no Render
      const authPath = path.resolve(process.cwd(), '.wwebjs_auth');
      if (fs.existsSync(authPath)) {
        this.log(`Limpando arquivos de autenticação em ${authPath}...`);
        try {
          fs.rmSync(authPath, { recursive: true, force: true });
          this.log('Arquivos de autenticação removidos com sucesso.');
        } catch (err) {
          this.log(`Erro ao remover arquivos de autenticação: ${err.message}`, 'error');
        }
      }

      this.statuses.set(userId, 'DISCONNECTED');
      this.qrCodes.delete(userId);
      return true;
  }
}

// Singleton: Exporta uma única instância do serviço
export const sessionService = new WhatsAppSessionService(new LocalSessionRepository());
