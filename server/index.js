import express from 'express';
import cors from 'cors';
import alunosRoutes from './routes/alunos.js';
import { iniciarCron } from './cron.js';
import { getStatus, desconectarWhatsApp } from './whatsapp.js';
import './whatsapp.js'; 

const app = express();
const PORT = 3001; 

app.use(cors()); 
app.use(express.json());

// Rotas da API de Alunos
app.use('/', alunosRoutes);

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

// Rota raiz
app.get('/', (req, res) => {
  res.send('NFINANCE Backend is running! 🚀');
});

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor backend rodando em http://localhost:${PORT}`);
  console.log(`📝 API disponível em http://localhost:${PORT}/alunos`);
  iniciarCron();
});
