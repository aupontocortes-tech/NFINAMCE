import { db } from '../data/db.js';

export const getSummary = async (req, res) => {
  const userId = req.user.id;
  
  try {
    // 1. Total de Alunos Ativos
    const activeResult = await db('alunos').count('* as count').where({ user_id: userId, status: 'ativo' }).first();
    const activeStudents = Number(activeResult.count);

    // 2. Receita Prevista (Soma das mensalidades dos alunos ativos)
    const revenueResult = await db('alunos').sum('valor as total').where({ user_id: userId, status: 'ativo' }).first();
    const expectedRevenue = revenueResult.total || 0;

    // 3. Mensalidades Pendentes (Mês atual)
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const pendingResult = await db('pagamentos as p')
      .join('alunos as a', 'p.aluno_id', 'a.id')
      .where('a.user_id', userId)
      .where('p.mes', currentMonth)
      .where('p.ano', currentYear)
      .where('p.status', 'pendente')
      .count('* as count')
      .sum('p.valor as total')
      .first();

    // 4. Alunos com vencimento próximo (próximos 5 dias)
    const nextFiveDays = new Date();
    nextFiveDays.setDate(today.getDate() + 5);
    
    const todayStr = today.toISOString().split('T')[0];
    const limitStr = nextFiveDays.toISOString().split('T')[0];

    const upcomingPayments = await db('pagamentos as p')
      .join('alunos as a', 'p.aluno_id', 'a.id')
      .where('a.user_id', userId)
      .where('p.status', 'pendente')
      .whereBetween('p.data_vencimento', [todayStr, limitStr])
      .select('a.nome', 'p.valor', 'p.data_vencimento')
      .orderBy('p.data_vencimento', 'asc');

    // Formatar retorno para o frontend
    res.json({
      totalStudents: activeStudents,
      expectedRevenue: Number(expectedRevenue),
      pendingCount: Number(pendingResult.count || 0),
      pendingValue: Number(pendingResult.total || 0),
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
