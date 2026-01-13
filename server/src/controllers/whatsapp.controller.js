import { sessionService } from '../whatsapp/session.service.js';

export const startSession = async (req, res) => {
  try {
    const { userId, force } = req.body; // Espera receber { userId: 'algum-id', force: boolean }
    
    if (!userId) {
      return res.status(400).json({ error: 'userId é obrigatório' });
    }

    const result = await sessionService.startSession(userId, force);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStatus = (req, res) => {
  const { userId } = req.params;
  
  if (!userId) {
    return res.status(400).json({ error: 'userId é obrigatório na URL' });
  }

  const status = sessionService.getStatus(userId);
  res.json(status);
};

export const getQrCode = (req, res) => {
  const { userId } = req.params;
  const { qrCode } = sessionService.getStatus(userId);

  if (qrCode) {
    // Retorna a imagem diretamente ou o base64
    res.json({ qrCode });
  } else {
    res.status(404).json({ message: 'QR Code não disponível (Sessão pode estar pronta ou desconectada)' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { userId, phoneNumber, message } = req.body;

    if (!userId || !phoneNumber || !message) {
      return res.status(400).json({ error: 'userId, phoneNumber e message são obrigatórios' });
    }

    await sessionService.sendMessage(userId, phoneNumber, message);
    res.json({ success: true, message: 'Mensagem enviada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const disconnectSession = async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId é obrigatório' });
    
    await sessionService.disconnect(userId);
    res.json({ success: true, message: 'Sessão desconectada' });
};
