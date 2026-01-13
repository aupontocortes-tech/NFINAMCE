import cron from 'node-cron';
import { alunos } from '../data/alunos.js';
import { sessionService } from '../whatsapp/session.service.js';
import { gerarMensagem } from '../utils/gerarMensagem.js';

const DEFAULT_SESSION_ID = 'default';

export const verificarCobrancas = async () => {
  console.log('--- 🔄 Iniciando verificação de cobranças (Cron) ---');

  const { status } = sessionService.getStatus(DEFAULT_SESSION_ID);
  
  if (status !== 'READY') {
    console.error(`⚠️ ABORTANDO COBRANÇA: Sessão '${DEFAULT_SESSION_ID}' não está PRONTA (Status: ${status}).`);
    return;
  }

  const hoje = new Date();
  const diaAtual = hoje.getDate();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  let enviadas = 0;

  for (const aluno of alunos) {
    // Regra 1: Dia Vencimento == Dia Atual
    if (aluno.diaVencimento !== diaAtual) continue;
    
    // Regra 2: Status Pendente
    if (aluno.status !== 'PENDENTE') continue;

    // Regra 3: Não enviou neste mês
    let jaEnviou = false;
    if (aluno.ultimaCobranca) {
      const dataUltima = new Date(aluno.ultimaCobranca);
      if (dataUltima.getMonth() === mesAtual && dataUltima.getFullYear() === anoAtual) {
        jaEnviou = true;
      }
    }

    if (!jaEnviou) {
      const msg = gerarMensagem(aluno);
      try {
        await sessionService.sendMessage(DEFAULT_SESSION_ID, aluno.telefone, msg);
        aluno.ultimaCobranca = new Date().toISOString();
        enviadas++;
      } catch (error) {
        console.error(`Erro ao enviar cobrança para ${aluno.nome}:`, error.message);
      }
    }
  }
  console.log(`--- ✅ Fim da verificação. ${enviadas} mensagens enviadas. ---`);
};

export const cobrarPendentesAtrasados = async () => {
  console.log('--- 🔄 Iniciando cobrança manual de atrasados ---');

  const { status } = sessionService.getStatus(DEFAULT_SESSION_ID);
  
  if (status !== 'READY') {
    return { success: false, message: `Sessão WhatsApp '${DEFAULT_SESSION_ID}' não está conectada` };
  }

  const hoje = new Date();
  const diaAtual = hoje.getDate();
  let enviadas = 0;

  for (const aluno of alunos) {
    // Regra: Pendente e Dia Atual >= Dia Vencimento (já venceu ou vence hoje)
    if (aluno.status === 'PENDENTE' && diaAtual >= aluno.diaVencimento) {
      const msg = gerarMensagem(aluno);
      try {
        await sessionService.sendMessage(DEFAULT_SESSION_ID, aluno.telefone, msg);
        aluno.ultimaCobranca = new Date().toISOString();
        enviadas++;
      } catch (error) {
        console.error(`Erro ao enviar cobrança atrasada para ${aluno.nome}:`, error.message);
      }
    }
  }
  return { success: true, enviadas };
};

// Agendar para 09:00 todo dia
export const iniciarCron = () => {
  cron.schedule('0 9 * * *', verificarCobrancas, {
    scheduled: true,
    timezone: "America/Sao_Paulo"
  });
  console.log('⏰ Cron job de cobrança configurado (09:00 diariamente).');
};
