import { db, calculateHours } from '../data/db.js';

const buildMonthFilter = (mes) => {
  // mes in YYYY-MM
  if (!mes) return '';
  return ` AND substr(data, 1, 7) = '${mes}'`;
};

export const list = (req, res) => {
  const { funcionario_id, mes } = req.query;
  let sql = 'SELECT * FROM horarios WHERE 1=1';
  const params = [];
  if (funcionario_id) { sql += ' AND funcionario_id = ?'; params.push(funcionario_id); }
  if (mes) { sql += buildMonthFilter(mes); }
  sql += ' ORDER BY data DESC, id DESC';
  const rows = db.prepare(sql).all(...params);
  res.json(rows);
};

export const create = (req, res) => {
  const { funcionario_id, data, hora_inicio, hora_fim } = req.body;
  if (!funcionario_id || !data || !hora_inicio || !hora_fim) return res.status(400).json({ error: 'Campos obrigatórios: funcionario_id, data, hora_inicio, hora_fim' });
  const horas = calculateHours(hora_inicio, hora_fim);
  const info = db.prepare('INSERT INTO horarios (funcionario_id, data, hora_inicio, hora_fim, horas) VALUES (?, ?, ?, ?, ?)')
    .run(funcionario_id, data, hora_inicio, hora_fim, horas);
  const row = db.prepare('SELECT * FROM horarios WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(row);
};

export const remove = (req, res) => {
  const { id } = req.params;
  const info = db.prepare('DELETE FROM horarios WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'Registro não encontrado' });
  res.status(204).send();
};