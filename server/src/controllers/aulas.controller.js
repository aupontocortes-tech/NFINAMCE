import { db } from '../data/db.js';

const calculateHours = (start, end) => {
  if (!start || !end) return 0;
  const [h1, m1] = start.split(':').map(Number);
  const [h2, m2] = end.split(':').map(Number);
  const totalH1 = h1 + m1 / 60;
  const totalH2 = h2 + m2 / 60;
  return Number((totalH2 - totalH1).toFixed(2));
};

export const list = (req, res) => {
  try {
    const userId = req.user.id;
    // Get all classes linked to students of this user
    const rows = db.prepare(`
      SELECT a.*, s.nome as aluno_nome, s.email as aluno_email 
      FROM aulas a
      JOIN alunos s ON a.aluno_id = s.id
      WHERE s.user_id = ?
      ORDER BY a.dia_semana, a.hora_inicio
    `).all(userId);
    res.json(rows);
  } catch (e) {
    console.error('Erro ao listar aulas:', e);
    res.status(500).json({ error: 'Erro interno' });
  }
};

export const create = (req, res) => {
  try {
    const userId = req.user.id;
    const { aluno_id, dia_semana, data, hora_inicio, hora_fim, tipo_treino } = req.body;
    
    if (!aluno_id || !hora_inicio || !hora_fim) {
      return res.status(400).json({ error: 'Campos obrigatórios: aluno_id, hora_inicio, hora_fim' });
    }

    if (!dia_semana && !data) {
      return res.status(400).json({ error: 'É necessário informar dia da semana (recorrente) ou data específica' });
    }

    // Validate if student belongs to user
    const student = db.prepare('SELECT id FROM alunos WHERE id = ? AND user_id = ?').get(aluno_id, userId);
    if (!student) {
      return res.status(403).json({ error: 'Aluno não encontrado ou sem permissão' });
    }

    const horas = calculateHours(hora_inicio, hora_fim);
    
    const info = db.prepare(`
      INSERT INTO aulas (aluno_id, dia_semana, data, hora_inicio, hora_fim, horas, tipo_treino) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(aluno_id, dia_semana || null, data || null, hora_inicio, hora_fim, horas, tipo_treino || null);
    
    const row = db.prepare(`
      SELECT a.*, s.nome as aluno_nome 
      FROM aulas a 
      JOIN alunos s ON a.aluno_id = s.id 
      WHERE a.id = ?
    `).get(info.lastInsertRowid);
    
    res.status(201).json(row);
  } catch (e) {
    console.error('Erro ao criar aula:', e);
    res.status(500).json({ error: 'Erro interno' });
  }
};

export const remove = (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    // Verify ownership via join
    const aula = db.prepare(`
      SELECT a.id 
      FROM aulas a 
      JOIN alunos s ON a.aluno_id = s.id 
      WHERE a.id = ? AND s.user_id = ?
    `).get(id, userId);

    if (!aula) {
      return res.status(404).json({ error: 'Aula não encontrada ou sem permissão' });
    }

    db.prepare('DELETE FROM aulas WHERE id = ?').run(id);
    res.status(204).send();
  } catch (e) {
    console.error('Erro ao remover aula:', e);
    res.status(500).json({ error: 'Erro interno' });
  }
};

export const update = (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { aluno_id, dia_semana, data, hora_inicio, hora_fim, tipo_treino } = req.body;

    if (!aluno_id || !hora_inicio || !hora_fim) {
      return res.status(400).json({ error: 'Campos obrigatórios: aluno_id, hora_inicio, hora_fim' });
    }

    if (!dia_semana && !data) {
      return res.status(400).json({ error: 'É necessário informar dia da semana (recorrente) ou data específica' });
    }

    // Verify ownership via join (ensure current aula belongs to user)
    const existingAula = db.prepare(`
      SELECT a.id 
      FROM aulas a 
      JOIN alunos s ON a.aluno_id = s.id 
      WHERE a.id = ? AND s.user_id = ?
    `).get(id, userId);

    if (!existingAula) {
      return res.status(404).json({ error: 'Aula não encontrada ou sem permissão' });
    }

    // Verify if new student belongs to user
    const student = db.prepare('SELECT id FROM alunos WHERE id = ? AND user_id = ?').get(aluno_id, userId);
    if (!student) {
      return res.status(403).json({ error: 'Aluno não encontrado ou sem permissão' });
    }

    const horas = calculateHours(hora_inicio, hora_fim);

    db.prepare(`
      UPDATE aulas 
      SET aluno_id = ?, dia_semana = ?, data = ?, hora_inicio = ?, hora_fim = ?, horas = ?, tipo_treino = ?
      WHERE id = ?
    `).run(aluno_id, dia_semana || null, data || null, hora_inicio, hora_fim, horas, tipo_treino || null, id);

    const row = db.prepare(`
      SELECT a.*, s.nome as aluno_nome 
      FROM aulas a 
      JOIN alunos s ON a.aluno_id = s.id 
      WHERE a.id = ?
    `).get(id);

    res.json(row);
  } catch (e) {
    console.error('Erro ao atualizar aula:', e);
    res.status(500).json({ error: 'Erro interno' });
  }
};
