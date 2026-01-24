import { db } from '../data/db.js';

export const list = (req, res) => {
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

    const payments = db.prepare(`
      SELECT 
        p.id, 
        p.valor, 
        p.data_vencimento, 
        p.status, 
        p.mes, 
        p.ano,
        p.data_pagamento,
        p.metodo_pagamento,
        a.nome as aluno_nome,
        a.email as aluno_email
      FROM pagamentos p
      JOIN alunos a ON p.aluno_id = a.id
      WHERE a.user_id = ? AND p.mes = ? AND p.ano = ?
      ORDER BY p.data_vencimento ASC
    `).all(userId, mes, ano);

    res.json(payments);
  } catch (e) {
    console.error('Erro ao listar pagamentos:', e);
    res.status(500).json({ error: 'Erro interno ao listar pagamentos' });
  }
};

export const markAsPaid = (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { metodo } = req.body; // 'pix', 'dinheiro', 'cartao', etc.

    // Verify if payment belongs to a student of this user
    const payment = db.prepare(`
      SELECT p.* 
      FROM pagamentos p
      JOIN alunos a ON p.aluno_id = a.id
      WHERE p.id = ? AND a.user_id = ?
    `).get(id, userId);

    if (!payment) {
      return res.status(404).json({ error: 'Pagamento não encontrado ou sem permissão' });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    db.prepare(`
      UPDATE pagamentos 
      SET status = 'pago', data_pagamento = ?, metodo_pagamento = ?
      WHERE id = ?
    `).run(todayStr, metodo || 'outros', id);

    res.json({ success: true, message: 'Pagamento marcado como pago' });
  } catch (e) {
    console.error('Erro ao atualizar pagamento:', e);
    res.status(500).json({ error: 'Erro interno ao atualizar pagamento' });
  }
};
