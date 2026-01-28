import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import studentsRoutes from './routes/students.routes.js';
import aulasRoutes from './routes/aulas.routes.js';
import chargesRoutes from './routes/charges.routes.js';
import paymentsRoutes from './routes/payments.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import { iniciarCron } from './services/cron.service.js';
import { initSchema } from './data/db.js';
import { importInitialSpreadsheetIfNeeded } from './services/import.service.js';
import { runInitialSeed2026 } from './services/seed2026.service.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/auth', authRoutes);
app.use('/', studentsRoutes);
app.use('/', aulasRoutes);
app.use('/', chargesRoutes);
app.use('/', paymentsRoutes);
app.use('/', dashboardRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Root
app.get('/', (req, res) => {
  res.send('NFinance Backend V2.1.0 (Render Check) is running! 🚀');
});

// Tratamento global de erros
app.use((err, req, res, next) => {
  console.error('❌ Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Inicializa DB e importação inicial
initSchema()
  .then(async () => {
    try {
      // Tenta rodar seed/importação se necessário
      await runInitialSeed2026();
    } catch (err) {
      console.error('Erro na inicialização de dados (Seed/Import):', err);
    }

    // Inicialização - Render usa PORT dinâmico
    const PORT = process.env.PORT || config.port;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 Servidor V2.1.0 rodando na porta ${PORT}`);
      console.log(`📝 API Alunos: /alunos`);
      console.log(`💚 Health Check: /health`);

      // Inicia o agendamento de tarefas
      iniciarCron();
    });
  })
  .catch((err) => {
    console.error('❌ ERRO CRÍTICO ao inicializar o servidor:', err);
    console.error('Stack:', err.stack);
    process.exit(1);
  });

// Tratamento de Processos
process.on('uncaughtException', (err) => {
  console.error('❌ CRASH: Exceção não tratada:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ CRASH: Rejeição de Promise não tratada:', reason);
});
