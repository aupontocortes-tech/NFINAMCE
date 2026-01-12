import express from 'express';
import cors from 'cors';
import alunosRoutes from './routes/alunos.js';
import { iniciarCron } from './cron.js';
import { getStatus, desconectarWhatsApp, enviarMensagem } from './whatsapp.js';
import './whatsapp.js'; 

const app = express();
const PORT = process.env.PORT || 3001; 

app.use(cors()); 
app.use(express.json());

// Rotas da API de Alunos
app.use('/', alunosRoutes);

// Rotas de Mensagem
app.post('/message/send', async (req, res) => {
  const { phoneNumber, message } = req.body;

  if (!phoneNumber || !message) {
    return res.status(400).json({ error: 'Número e mensagem são obrigatórios' });
  }

  try {
    await enviarMensagem(phoneNumber, message);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro na rota /message/send:', error);
    res.status(500).json({ error: error.message || 'Erro interno ao enviar mensagem' });
  }
});

// Rotas do WhatsApp
app.get('/whatsapp/status', (req, res) => {
  res.json(getStatus());
});

app.post('/whatsapp/desconectar', async (req, res) => {
  const sucesso = await desconectarWhatsApp();
  if (sucesso) {
    res.json({ message: 'Desconectado com sucesso' });
  } else {
    res.status(400).json({ message: 'Não foi possível desconectar ou já estava desconectado' });
  }
});

app.post('/whatsapp/restart', async (req, res) => {
  try {
    await reiniciarWhatsApp();
    res.json({ message: 'Reinicialização do WhatsApp iniciada com sucesso' });
  } catch (error) {
    console.error('Erro ao reiniciar WhatsApp:', error);
    res.status(500).json({ error: 'Falha ao reiniciar serviço do WhatsApp' });
  }
});

// Rota raiz
app.get('/', (req, res) => {
  res.send('NFINANCE Backend is running! 🚀');
});

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor backend rodando em http://localhost:${PORT}`);
  console.log(`📝 API disponível em http://localhost:${PORT}/alunos`);
  iniciarCron();
});
