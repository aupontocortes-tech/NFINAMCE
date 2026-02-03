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
import { runSeedAgendaFicticia, ensureDemoUser, ensureAlunosFicticios } from './services/seedAgendaFicticia.service.js';

const app = express();

// CORS: permite frontend em localhost e na Render (conexão frontend ↔ backend)
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://nfinance-site.onrender.com',
];
const corsOptions = {
  origin: (origin, cb) => {
    const ok = !origin ||
      allowedOrigins.includes(origin) ||
      (origin && origin.endsWith('.onrender.com'));
    cb(null, ok);
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
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
      // Em desenvolvimento: demo + alunos fictícios para testar a agenda
      if (!process.env.DATABASE_URL) {
        await ensureDemoUser();
        await ensureAlunosFicticios();
      }
      await runSeedAgendaFicticia();
    } catch (err) {
      console.error('Erro na inicialização de dados (Seed/Import):', err);
    }

    // Inicialização - Render usa PORT dinâmico
    const PORT = process.env.PORT || config.port;
    app.listen(PORT, '0.0.0.0', () => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/04f05b88-2244-43f2-bc12-4e88d10b62fd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:listen',message:'server listening',data:{port:PORT},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,E'})}).catch(()=>{});
      // #endregion
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
