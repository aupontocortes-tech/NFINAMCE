import { db } from '../data/db.js';

export const getSummary = (req, res) => {
  const userId = req.user.id;
  
  try {
    // 1. Total de Alunos Ativos
    const activeStudents = db.prepare('SELECT COUNT(*) as count FROM alunos WHERE user_id = ? AND status = "ativo"').get(userId).count;

    // 2. Receita Prevista (Soma das mensalidades dos alunos ativos)
    const revenueRow = db.prepare('SELECT SUM(valor) as total FROM alunos WHERE user_id = ? AND status = "ativo"').get(userId);
    const expectedRevenue = revenueRow.total || 0;

    // 3. Mensalidades Pendentes (Mês atual)
    // Precisamos fazer join com alunos para garantir que o pagamento pertence a um aluno do usuário
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const pendingPayments = db.prepare(`
      SELECT COUNT(*) as count, SUM(p.valor) as total
      FROM pagamentos p
      JOIN alunos a ON p.aluno_id = a.id
      WHERE a.user_id = ? 
        AND p.mes = ? 
        AND p.ano = ? 
        AND p.status = 'pendente'
    `).get(userId, currentMonth, currentYear);

    // 4. Alunos com vencimento próximo (próximos 5 dias)
    // Vamos olhar para os pagamentos pendentes do mês atual que vencem em breve
    // Ou simplesmente olhar o dia de vencimento do aluno e ver se está perto?
    // Melhor olhar a tabela de pagamentos para ter a data exata.
    
    // Calcular intervalo de datas: hoje até hoje+5 dias
    const nextFiveDays = new Date();
    nextFiveDays.setDate(today.getDate() + 5);
    
    const todayStr = today.toISOString().split('T')[0];
    const limitStr = nextFiveDays.toISOString().split('T')[0];

    const upcomingPayments = db.prepare(`
      SELECT a.nome, p.valor, p.data_vencimento
      FROM pagamentos p
      JOIN alunos a ON p.aluno_id = a.id
      WHERE a.user_id = ?
        AND p.status = 'pendente'
        AND p.data_vencimento BETWEEN ? AND ?
      ORDER BY p.data_vencimento ASC
    `).all(userId, todayStr, limitStr);

    // Formatar retorno para o frontend
    res.json({
      totalStudents: activeStudents,
      expectedRevenue: expectedRevenue,
      pendingCount: pendingPayments.count || 0,
      pendingValue: pendingPayments.total || 0,
      upcomingPayments: upcomingPayments.map(p => ({
        name: p.nome,
        value: p.valor,
        dueDate: p.data_vencimento
      }))
    });

  } catch (error) {
    console.error('Erro ao obter resumo do dashboard:', error);
    res.status(500).json({ error: 'Erro interno ao carregar dashboard' });
  }
};
