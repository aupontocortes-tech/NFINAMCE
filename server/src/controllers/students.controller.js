import { db } from '../data/db.js';

export const list = (req, res) => {
  const rows = db.prepare('SELECT * FROM alunos ORDER BY nome').all();
  res.json(rows);
};

export const create = (req, res) => {
  try {
    const { nome, telefone, valor, plano, status, vencimento } = req.body;
    if (!nome || valor === undefined || !plano) return res.status(400).json({ error: 'Campos obrigatórios: nome, valor, plano' });
    const info = db.prepare('INSERT INTO alunos (nome, telefone, valor, plano, vencimento, status) VALUES (?, ?, ?, ?, ?, ?)')
      .run(nome, telefone || '', Number(valor), (plano||'mensal').toLowerCase(), (vencimento ?? null), status || 'ativo');
    const aluno = db.prepare('SELECT * FROM alunos WHERE id = ?').get(info.lastInsertRowid);
    // Criar cobrança do mês atual para o novo aluno (garante visibilidade em Pagamentos)
    try {
      const month = new Date().toISOString().slice(0,7); // YYYY-MM
      const day = (() => {
        if (!aluno.vencimento) return 5; // default dia 5
        const m = String(aluno.vencimento).match(/(\d{1,2})$/);
        return m ? Number(m[1]) : 5;
      })();
      const vencStr = `${month}-${String(day).padStart(2, '0')}`;
      db.prepare('INSERT OR IGNORE INTO cobrancas (aluno_id, mes, valor_total, vencimento, status) VALUES (?, ?, ?, ?, "aberto")')
        .run(aluno.id, month, Number(aluno.valor || 0), vencStr);
    } catch (chargeErr) {
      console.error('Aviso: Falha ao criar cobrança automática do mês atual:', chargeErr.message);
    }

    res.status(201).json(aluno);
  } catch (e) {
    console.error('Erro ao criar aluno:', e);
    res.status(500).json({ error: e.message || 'Erro interno' });
  }
};

export const update = (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM alunos WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Aluno não encontrado' });
  const { nome, telefone, valor, plano, status, vencimento } = req.body;
  db.prepare('UPDATE alunos SET nome = ?, telefone = ?, valor = ?, plano = ?, vencimento = ?, status = ? WHERE id = ?')
    .run(
      nome ?? existing.nome,
      telefone ?? existing.telefone,
      valor ?? existing.valor,
      (plano ?? existing.plano),
      (vencimento ?? existing.vencimento),
      status ?? existing.status,
      id
    );
  const row = db.prepare('SELECT * FROM alunos WHERE id = ?').get(id);
  res.json(row);
};

export const remove = (req, res) => {
  const { id } = req.params;
  const info = db.prepare('DELETE FROM alunos WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'Aluno não encontrado' });
  res.status(204).send();
};