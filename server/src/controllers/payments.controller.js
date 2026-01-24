import { db } from '../data/db.js';

export const list = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month } = req.query; // Format: YYYY-MM

    let mes, ano;
    if (month) {
      [ano, mes] = month.split('-').map(Number);
    } else {
      const today = new Date();
      mes = today.getMonth() + 1;
      ano = today.getFullYear();
    }

    const payments = await db('pagamentos as p')
      .join('alunos as a', 'p.aluno_id', 'a.id')
      .where('a.user_id', userId)
      .where('p.mes', mes)
      .where('p.ano', ano)
      .select(
        'p.id', 
        'p.valor', 
        'p.data_vencimento', 
        'p.status', 
        'p.mes', 
        'p.ano', 
        'p.data_pagamento',
        'p.metodo as metodo_pagamento',
        'a.nome as aluno_nome',
        'a.email as aluno_email'
      )
      .orderBy('p.data_vencimento', 'asc');

    res.json(payments);
  } catch (e) {
    console.error('Erro ao listar pagamentos:', e);
    res.status(500).json({ error: 'Erro interno ao listar pagamentos' });
  }
};

export const markAsPaid = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { metodo } = req.body; // 'pix', 'dinheiro', 'cartao', etc.

    // Verify if payment belongs to a student of this user
    const payment = await db('pagamentos as p')
      .join('alunos as a', 'p.aluno_id', 'a.id')
      .where('p.id', id)
      .where('a.user_id', userId)
      .select('p.*')
      .first();

    if (!payment) {
      return res.status(404).json({ error: 'Pagamento não encontrado ou sem permissão' });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    await db('pagamentos').where({ id }).update({
      status: 'pago',
      data_pagamento: todayStr,
      metodo: metodo || 'outros'
    });

    res.json({ success: true, message: 'Pagamento marcado como pago' });
  } catch (e) {
    console.error('Erro ao atualizar pagamento:', e);
    res.status(500).json({ error: 'Erro interno ao atualizar pagamento' });
  }
};
