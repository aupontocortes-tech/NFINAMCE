import { Router } from 'express';
import * as WhatsAppController from '../controllers/whatsapp.controller.js';

const router = Router();

// Rotas Legacy (Compatibilidade com Frontend atual)
const DEFAULT_USER_ID = 'default';

router.get('/status', (req, res) => {
  req.params = req.params || {};
  req.params.userId = DEFAULT_USER_ID;
  WhatsAppController.getStatus(req, res);
});

router.post('/restart', (req, res) => {
  req.body = req.body || {};
  req.body.userId = DEFAULT_USER_ID;
  req.body.force = true; // Força o reinício
  WhatsAppController.startSession(req, res);
});

router.post('/desconectar', (req, res) => {
  req.body = req.body || {};
  req.body.userId = DEFAULT_USER_ID;
  WhatsAppController.disconnectSession(req, res);
});

// Inicia (ou recupera) uma sessão
router.post('/start', WhatsAppController.startSession);

// Obtém status da sessão (READY, QR_READY, etc)
router.get('/status/:userId', WhatsAppController.getStatus);

// Obtém apenas o QR Code (atalho)
router.get('/qr/:userId', WhatsAppController.getQrCode);

// Obtém logs de debug do servidor
router.get('/debug/logs', WhatsAppController.getLogs);

// Envia mensagem
router.post('/send', (req, res) => {
  if (!req.body.userId) {
    req.body.userId = DEFAULT_USER_ID;
  }
  WhatsAppController.sendMessage(req, res);
});

// Desconecta sessão
router.post('/disconnect', WhatsAppController.disconnectSession);

export default router;
