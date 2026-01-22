import { db, calculateHours } from '../data/db.js';

const buildMonthFilter = (mes) => {
  if (!mes) return '';
  return ` AND substr(data, 1, 7) = '${mes}'`;
};

export const list = (req, res) => {
  const { aluno_id, mes } = req.query;
  let sql = 'SELECT * FROM aulas WHERE 1=1';
  const params = [];
  if (aluno_id) { sql += ' AND aluno_id = ?'; params.push(aluno_id); }
  if (mes) { sql += buildMonthFilter(mes); }
  sql += ' ORDER BY data DESC, id DESC';
  const rows = db.prepare(sql).all(...params);
  res.json(rows);
};

export const create = (req, res) => {
  const { aluno_id, data, dia_semana, hora_inicio, hora_fim, tipo_treino } = req.body;
  if (!aluno_id || (!data && !dia_semana) || !hora_inicio || !hora_fim) {
    return res.status(400).json({ error: 'Campos obrigatórios: aluno_id, (data ou dia_semana), hora_inicio, hora_fim' });
  }
  const horas = calculateHours(hora_inicio, hora_fim);
  const info = db.prepare('INSERT INTO aulas (aluno_id, data, dia_semana, hora_inicio, hora_fim, horas, tipo_treino) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(aluno_id, data || null, dia_semana || null, hora_inicio, hora_fim, horas, tipo_treino || null);
  const row = db.prepare('SELECT * FROM aulas WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(row);
};

export const remove = (req, res) => {
  const { id } = req.params;
  const info = db.prepare('DELETE FROM aulas WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'Registro não encontrado' });
  res.status(204).send();
};