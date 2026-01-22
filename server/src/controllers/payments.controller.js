import { db } from '../data/db.js';

export const list = (req, res) => {
  try {
    const { mes } = req.query;
    const month = mes || new Date().toISOString().slice(0,7);
    const stmt = db.prepare(`
      SELECT c.id as cobranca_id, c.aluno_id, a.nome, a.telefone, c.mes, c.valor_total, c.vencimento, c.status,
             COALESCE(SUM(p.valor), 0) AS valor_pago,
             MAX(p.data) AS ultima_data,
             MAX(p.metodo) AS ultimo_metodo
      FROM cobrancas c
      JOIN alunos a ON a.id = c.aluno_id
      LEFT JOIN pagamentos p ON p.cobranca_id = c.id
      WHERE c.mes = ?
      GROUP BY c.id
      ORDER BY a.nome ASC
    `);
    const rows = stmt.all(month);
    res.json(rows);
  } catch (e) {
    console.error('Erro ao listar pagamentos:', e);
    res.status(500).json({ error: 'Erro interno' });
  }
};

export const create = (req, res) => {
  try {
    const { cobranca_id, valor, data, metodo } = req.body;
    if (!cobranca_id) return res.status(400).json({ error: 'cobranca_id é obrigatório' });
    const charge = db.prepare('SELECT id, status, valor_total FROM cobrancas WHERE id = ?').get(cobranca_id);
    if (!charge) return res.status(404).json({ error: 'Cobrança não encontrada' });

    const v = Number(valor ?? charge.valor_total);
    if (!v || v <= 0) return res.status(400).json({ error: 'valor inválido' });

    const insert = db.prepare('INSERT INTO pagamentos (cobranca_id, valor, data, metodo) VALUES (?, ?, ?, ?)');
    const now = data || new Date().toISOString();
    insert.run(cobranca_id, v, now, metodo || null);

    db.prepare('UPDATE cobrancas SET status = ? WHERE id = ?').run('pago', cobranca_id);
    res.status(201).json({ success: true });
  } catch (e) {
    console.error('Erro ao criar pagamento:', e);
    res.status(500).json({ error: 'Erro interno' });
  }
};