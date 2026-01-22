import { db } from '../data/db.js';

export const list = (req, res) => {
  try {
    const { mes, aluno_id } = req.query;
    let sql = 'SELECT * FROM cobrancas WHERE 1=1';
    const params = [];
    if (mes) { sql += ' AND mes = ?'; params.push(mes); }
    if (aluno_id) { sql += ' AND aluno_id = ?'; params.push(aluno_id); }
    sql += ' ORDER BY created_at DESC';
    const rows = db.prepare(sql).all(...params);
    res.json(rows);
  } catch (e) {
    console.error('Erro ao listar cobranças:', e);
    res.status(500).json({ error: 'Erro interno' });
  }
};

function resolveVencimentoForMonth(s, mes) {
  const raw = (s.vencimento || '').toString().trim();
  let day = 5; // default
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    day = Number(raw.split('-')[2]);
  } else if (/^\d{1,2}$/.test(raw)) {
    day = Number(raw);
  }
  if (day < 1 || day > 31) day = 5;
  return `${mes}-${String(day).padStart(2, '0')}`;
}

export const generateMonthly = (req, res) => {
  try {
    const { mes } = req.params; // YYYY-MM
    if (!mes) return res.status(400).json({ error: 'Informe o mês no formato YYYY-MM' });

    const students = db.prepare('SELECT * FROM alunos WHERE status = "ativo"').all();
    const insertCharge = db.prepare(`INSERT INTO cobrancas (aluno_id, mes, valor_total, vencimento, status) VALUES (?, ?, ?, ?, 'aberto')`);
    const getClassesByMonth = db.prepare(`SELECT horas FROM aulas WHERE aluno_id = ? AND data IS NOT NULL AND substr(data,1,7) = ?`);

    let totalCharges = 0;
    for (const s of students) {
      let valor = 0;
      const plano = (s.plano || 'mensal').toLowerCase();
      if (plano === 'mensal') {
        valor = Number(s.valor || 0);
      } else if (plano === 'semanal') {
        valor = Number(((s.valor || 0) * 4).toFixed(2));
      } else if (plano === 'avulsa' || plano === 'aula avulsa' || plano === 'avulso') {
        const rows = getClassesByMonth.all(s.id, mes);
        const aulasNoMes = rows.length;
        valor = Number(((s.valor || 0) * aulasNoMes).toFixed(2));
      } else {
        valor = Number(s.valor || 0);
      }
      const vencimento = resolveVencimentoForMonth(s, mes);
      insertCharge.run(s.id, mes, valor, vencimento);
      totalCharges++;
    }

    res.json({ message: `Cobranças geradas para ${totalCharges} alunos`, mes });
  } catch (e) {
    console.error('Erro ao gerar cobranças:', e);
    res.status(500).json({ error: 'Erro interno' });
  }
};

export const markPaid = (req, res) => {
  try {
    const { id } = req.params;
    const info = db.prepare('UPDATE cobrancas SET status = "pago" WHERE id = ?').run(id);
    if (info.changes === 0) return res.status(404).json({ error: 'Cobrança não encontrada' });
    const row = db.prepare('SELECT * FROM cobrancas WHERE id = ?').get(id);
    res.json(row);
  } catch (e) {
    console.error('Erro ao marcar cobrança como paga:', e);
    res.status(500).json({ error: 'Erro interno' });
  }
};