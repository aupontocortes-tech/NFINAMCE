import { db } from '../data/db.js';

export const list = (req, res) => {
  const rows = db.prepare('SELECT * FROM funcionarios ORDER BY nome').all();
  res.json(rows);
};

export const create = (req, res) => {
  try {
    const { nome, telefone, valor, tipo_cobranca, status } = req.body;
    if (!nome || valor === undefined || !tipo_cobranca) return res.status(400).json({ error: 'Campos obrigatórios: nome, valor, tipo_cobranca' });
    const info = db.prepare('INSERT INTO funcionarios (nome, telefone, valor, tipo_cobranca, status) VALUES (?, ?, ?, ?, ?)')
      .run(nome, telefone || '', Number(valor), (tipo_cobranca||'mensal').toLowerCase(), status || 'ativo');
    const row = db.prepare('SELECT * FROM funcionarios WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(row);
  } catch (e) {
    console.error('Erro ao criar funcionário:', e);
    res.status(500).json({ error: e.message || 'Erro interno' });
  }
};

export const update = (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM funcionarios WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Funcionário não encontrado' });
  const { nome, telefone, valor, tipo_cobranca, status } = req.body;
  db.prepare('UPDATE funcionarios SET nome = ?, telefone = ?, valor = ?, tipo_cobranca = ?, status = ? WHERE id = ?')
    .run(nome ?? existing.nome, telefone ?? existing.telefone, valor ?? existing.valor, (tipo_cobranca ?? existing.tipo_cobranca), status ?? existing.status, id);
  const row = db.prepare('SELECT * FROM funcionarios WHERE id = ?').get(id);
  res.json(row);
};

export const remove = (req, res) => {
  const { id } = req.params;
  const info = db.prepare('DELETE FROM funcionarios WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'Funcionário não encontrado' });
  res.status(204).send();
};