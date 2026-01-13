import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import whatsappRoutes from './routes/whatsapp.routes.js';
import alunosRoutes from './routes/alunos.routes.js';
import { iniciarCron } from './services/cron.service.js';
import { sessionService } from './whatsapp/session.service.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/whatsapp', whatsappRoutes);
app.use('/', alunosRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Root
app.get('/', (req, res) => {
  res.send('NFINANCE Backend V2 (Layered Architecture) is running! 🚀');
});

// Tratamento global de erros
app.use((err, req, res, next) => {
  console.error('❌ Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Inicialização
app.listen(config.port, () => {
  console.log(`\n🚀 Servidor V2 rodando em http://localhost:${config.port}`);
  console.log(`📱 API WhatsApp: http://localhost:${config.port}/whatsapp`);
  console.log(`📝 API Alunos: http://localhost:${config.port}/alunos`);

  // Inicia o agendamento de tarefas
  iniciarCron();

  // Opcional: Iniciar sessão padrão automaticamente se desejar
  // sessionService.startSession('default').catch(e => console.error('Erro ao iniciar sessão default:', e));
});

// Tratamento de Processos
process.on('uncaughtException', (err) => {
  console.error('❌ CRASH: Exceção não tratada:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ CRASH: Rejeição de Promise não tratada:', reason);
});
