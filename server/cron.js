import cron from 'node-cron';
import { alunos } from './data/alunos.js';
import { enviarMensagemWhatsApp, getStatus } from './whatsapp.js';
import { gerarMensagem } from './utils/gerarMensagem.js';

const verificarCobrancas = async () => {
  console.log('--- 🔄 Iniciando verificação de cobranças ---');

  const { status } = getStatus();
  if (status !== 'CONNECTED') {
    console.error('⚠️ ABORTANDO COBRANÇA: WhatsApp não está conectado.');
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
      const sucesso = await enviarMensagemWhatsApp(aluno, msg);
      
      if (sucesso) {
        aluno.ultimaCobranca = new Date().toISOString();
        enviadas++;
      }
    }
  }
  console.log(`--- ✅ Fim da verificação. ${enviadas} mensagens enviadas. ---`);
};

const cobrarPendentesAtrasados = async () => {
  console.log('--- 🔄 Iniciando cobrança manual de atrasados ---');

  const { status } = getStatus();
  if (status !== 'CONNECTED') {
    return { success: false, message: 'WhatsApp desconectado' };
  }

  const hoje = new Date();
  const diaAtual = hoje.getDate();
  let enviadas = 0;

  for (const aluno of alunos) {
    // Regra: Pendente e Dia Atual >= Dia Vencimento (já venceu ou vence hoje)
    if (aluno.status === 'PENDENTE' && diaAtual >= aluno.diaVencimento) {
      const msg = gerarMensagem(aluno);
      // Adiciona um prefixo de cobrança se for atrasado?
      // Por enquanto usa a mensagem padrão gerada.
      
      const sucesso = await enviarMensagemWhatsApp(aluno, msg);
      if (sucesso) {
        aluno.ultimaCobranca = new Date().toISOString();
        enviadas++;
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
  console.log('⏰ Cron job de cobrança iniciado (09:00 diariamente).');
};

export { verificarCobrancas, cobrarPendentesAtrasados };
