import cron from 'node-cron';
import { db } from '../data/db.js';
import { sendEmail } from './email.service.js';
import { addDays, format } from 'date-fns';

export const verificarCobrancas = async () => {
  console.log('--- 🔄 Iniciando verificação de cobranças (Cron Email) ---');
  
  const today = new Date();
  const targetDate = addDays(today, 3);
  const targetDateStr = format(targetDate, 'yyyy-MM-dd'); // Check payments due in 3 days

  try {
    // 1. Find payments due in 3 days
    const pagamentos = await db('pagamentos as p')
      .join('alunos as a', 'p.aluno_id', 'a.id')
      .join('users as u', 'a.user_id', 'u.id')
      .where('p.data_vencimento', targetDateStr)
      .where('p.status', 'pendente')
      .select('p.*', 'a.nome as aluno_nome', 'a.email as aluno_email', 'a.mensagem_cobranca', 'u.email as professor_email', 'u.name as professor_nome');

    console.log(`🔎 Encontrados ${pagamentos.length} pagamentos vencendo em ${targetDateStr}`);

    for (const pag of pagamentos) {
      // Email para o Aluno
      if (pag.aluno_email) {
        const defaultMessage = `<p>Olá ${pag.aluno_nome},</p>
           <p>Sua mensalidade no valor de <strong>R$ ${pag.valor}</strong> vence em 3 dias (${format(targetDate, 'dd/MM/yyyy')}).</p>
           <p>Por favor, regularize seu pagamento.</p>`;

        const messageBody = pag.mensagem_cobranca 
          ? `<p>${pag.mensagem_cobranca.replace(/\n/g, '<br>')}</p>
             <hr>
             <p><small>Detalhes da Cobrança:<br>Valor: R$ ${pag.valor}<br>Vencimento: ${format(targetDate, 'dd/MM/yyyy')}</small></p>`
          : defaultMessage;

        await sendEmail(
          pag.aluno_email,
          'Lembrete de Pagamento - NFinance',
          messageBody
        );
      }

      // Email para o Professor
      if (pag.professor_email) {
        await sendEmail(
          pag.professor_email,
          'Aviso de Vencimento Próximo',
          `<p>Olá ${pag.professor_nome},</p>
           <p>A mensalidade do aluno <strong>${pag.aluno_nome}</strong> vence em 3 dias.</p>`
        );
      }
    }

    console.log('--- ✅ Fim da verificação de e-mails. ---');
  } catch (e) {
    console.error('Erro na verificação de cobranças:', e);
  }
};

export const gerarMensalidadesAutomaticas = async () => {
  console.log('--- 🔄 Gerando mensalidades automáticas... ---');
  const today = new Date();
  const currentMonth = today.getMonth() + 1; // 1-12
  const currentYear = today.getFullYear();

  try {
    // Select active students
    const alunos = await db('alunos').where('status', 'ativo');

    for (const aluno of alunos) {
      // Check if payment exists for this month
      const exists = await db('pagamentos')
        .where({ aluno_id: aluno.id, mes: currentMonth, ano: currentYear })
        .first();

      if (!exists) {
          // Calculate due date based on 'vencimento' (day)
          let dueDay = aluno.vencimento || 5; // Default to day 5 if null
          
          const dueDate = new Date(currentYear, currentMonth - 1, dueDay);
          const dueDateStr = format(dueDate, 'yyyy-MM-dd');

          await db('pagamentos').insert({
            aluno_id: aluno.id, 
            valor: aluno.valor, 
            data_vencimento: dueDateStr, 
            status: 'pendente', 
            mes: currentMonth, 
            ano: currentYear
          });
          
          console.log(`➕ Mensalidade gerada para ${aluno.nome} (${currentMonth}/${currentYear})`);
      }
    }
    console.log('--- ✅ Fim da geração de mensalidades. ---');
  } catch (e) {
    console.error('Erro ao gerar mensalidades:', e);
  }
};

// Agendar para 09:00 todo dia
export const iniciarCron = () => {
  cron.schedule('0 9 * * *', async () => {
    await gerarMensalidadesAutomaticas();
    await verificarCobrancas();
  }, {
    scheduled: true,
    timezone: "America/Sao_Paulo"
  });
  console.log('⏰ Cron Job agendado para 09:00 (Brasília)');
};
