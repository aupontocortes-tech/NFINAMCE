import fs from 'fs';
import path from 'path';
import { DisconnectReason } from '@whiskeysockets/baileys';
import { LocalSessionRepository } from './session.repository.js';
import { createWhatsAppClient } from './client.factory.js';
import { randomDelay } from '../utils/delay.js';

class WhatsAppSessionService {
  constructor(repository) {
    this.repository = repository;
    this.clients = new Map(); // userId -> Socket
    this.qrCodes = new Map(); // userId -> Raw QR String
    this.statuses = new Map(); // userId -> Status
    this.logs = []; // Logs internos
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    console.log(entry);
    this.logs.unshift(entry);
    if (this.logs.length > 50) this.logs.pop();
  }

  getLogs() {
    return this.logs;
  }

  /**
   * Inicia (ou recupera) uma sessão Baileys.
   */
  async startSession(userId, force = false) {
    this.log(`Solicitação de sessão para ${userId} (force=${force})`);

    // Se já existe conexão ativa
    if (this.clients.has(userId) && !force) {
      const status = this.statuses.get(userId);
      if (status === 'READY' || status === 'QR_READY') {
        return { status, qrCode: this.qrCodes.get(userId) };
      }
    }

    // Se forçado, desconecta primeiro
    if (force) {
      await this.disconnect(userId);
    }

    this.updateStatus(userId, 'INITIALIZING');
    
    try {
      const auth = await this.repository.getAuthStrategy(userId);
      const sock = await createWhatsAppClient(auth);
      
      this.clients.set(userId, sock);
      this.setupEvents(sock, userId);

      return { status: 'INITIALIZING', message: 'Socket iniciado' };

    } catch (error) {
      this.log(`Erro ao iniciar socket: ${error.message}`, 'error');
      this.updateStatus(userId, 'ERROR');
      throw error;
    }
  }

  setupEvents(sock, userId) {
    // Monitora atualizações da conexão
    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        this.log(`⚡ QR Code recebido para ${userId}`);
        this.qrCodes.set(userId, qr);
        this.updateStatus(userId, 'QR_READY');
      }

      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
        
        this.log(`⚠️ Conexão fechada. Motivo: ${lastDisconnect?.error}, Reconectar: ${shouldReconnect}`, 'warn');
        
        if (shouldReconnect) {
            this.updateStatus(userId, 'RECONNECTING');
            // Delay para evitar loop infinito em caso de erro persistente
            setTimeout(() => {
                this.startSession(userId, false);
            }, 3000); 
        } else {
            this.log(`🚫 Desconectado (Logout). Limpando sessão ${userId}.`);
            this.disconnect(userId);
            this.updateStatus(userId, 'DISCONNECTED');
        }
      } else if (connection === 'open') {
        this.log(`✅ Conexão aberta/autenticada para ${userId}`);
        this.updateStatus(userId, 'READY');
        this.qrCodes.delete(userId);
      }
    });
  }

  getStatus(userId) {
    return {
      status: this.statuses.get(userId) || 'DISCONNECTED',
      qrCode: this.qrCodes.get(userId) || null
    };
  }

  async sendMessage(userId, phoneNumber, message) {
    const sock = this.clients.get(userId);
    const status = this.statuses.get(userId);

    if (!sock || status !== 'READY') {
      throw new Error(`Sessão offline. Status: ${status}`);
    }

    // Formata número para JID do Baileys (apenas números + @s.whatsapp.net)
    const jid = phoneNumber.replace(/\D/g, '') + '@s.whatsapp.net';

    this.log(`⏳ Aguardando delay antiflood...`);
    await randomDelay(2000, 5000);

    try {
      await sock.sendMessage(jid, { text: message });
      this.log(`📤 Mensagem enviada para ${jid}`);
      return { success: true };
    } catch (error) {
      this.log(`Erro envio: ${error.message}`, 'error');
      throw error;
    }
  }

  updateStatus(userId, status) {
    this.statuses.set(userId, status);
  }

  async disconnect(userId) {
    const sock = this.clients.get(userId);
    if (sock) {
      sock.end(undefined); // Encerra a conexão WebSocket
      this.clients.delete(userId);
    }
    
    // Opcional: Limpar pasta de auth se for um "Logout" real
    // const authPath = path.resolve('baileys_auth_info', userId);
    // if (fs.existsSync(authPath)) fs.rmSync(authPath, { recursive: true, force: true });
    
    this.statuses.set(userId, 'DISCONNECTED');
    this.qrCodes.delete(userId);
    return true;
  }
}

export const sessionService = new WhatsAppSessionService(new LocalSessionRepository());
