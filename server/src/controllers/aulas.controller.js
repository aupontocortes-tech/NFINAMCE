import { db } from '../data/db.js';

const calculateHours = (start, end) => {
  if (!start || !end) return 0;
  const [h1, m1] = start.split(':').map(Number);
  const [h2, m2] = end.split(':').map(Number);
  const totalH1 = h1 + m1 / 60;
  const totalH2 = h2 + m2 / 60;
  return Number((totalH2 - totalH1).toFixed(2));
};

export const list = async (req, res) => {
  try {
    const userId = req.user.id;
    // Get all classes linked to students of this user
    const rows = await db('aulas as a')
      .join('alunos as s', 'a.aluno_id', 's.id')
      .where('s.user_id', userId)
      .select('a.*', 's.nome as aluno_nome', 's.email as aluno_email')
      .orderBy([{ column: 'a.dia_semana' }, { column: 'a.hora_inicio' }]);
    res.json(rows);
  } catch (e) {
    console.error('Erro ao listar aulas:', e);
    res.status(500).json({ error: 'Erro interno' });
  }
};

export const create = async (req, res) => {
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
    const student = await db('alunos').where({ id: aluno_id, user_id: userId }).first();
    if (!student) {
      return res.status(403).json({ error: 'Aluno não encontrado ou sem permissão' });
    }

    const horas = calculateHours(hora_inicio, hora_fim);
    
    const [inserted] = await db('aulas').insert({
      aluno_id,
      dia_semana: dia_semana || null,
      data: data || null,
      hora_inicio,
      hora_fim,
      horas,
      tipo_treino: tipo_treino || null
    }).returning('*');
    
    let aulaId = inserted && inserted.id ? inserted.id : (typeof inserted === 'number' || typeof inserted === 'string' ? inserted : null);

    // Fallback logic for ID if needed
    if (!aulaId && inserted) {
         if (inserted.id) aulaId = inserted.id;
    }

    if (!aulaId) {
        // Fallback: fetch latest created
         const last = await db('aulas').orderBy('id', 'desc').first();
         if (last) aulaId = last.id;
    }

    const row = await db('aulas as a')
      .join('alunos as s', 'a.aluno_id', 's.id')
      .where('a.id', aulaId)
      .select('a.*', 's.nome as aluno_nome')
      .first();
    
    res.status(201).json(row);
  } catch (e) {
    console.error('Erro ao criar aula:', e);
    res.status(500).json({ error: 'Erro interno' });
  }
};

export const remove = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    // Verify ownership via join
    const aula = await db('aulas as a')
      .join('alunos as s', 'a.aluno_id', 's.id')
      .where('a.id', id)
      .where('s.user_id', userId)
      .select('a.id')
      .first();

    if (!aula) {
      return res.status(404).json({ error: 'Aula não encontrada ou sem permissão' });
    }

    await db('aulas').where({ id }).del();
    res.status(204).send();
  } catch (e) {
    console.error('Erro ao remover aula:', e);
    res.status(500).json({ error: 'Erro interno' });
  }
};

export const update = async (req, res) => {
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
    const existingAula = await db('aulas as a')
      .join('alunos as s', 'a.aluno_id', 's.id')
      .where('a.id', id)
      .where('s.user_id', userId)
      .select('a.id')
      .first();

    if (!existingAula) {
      return res.status(404).json({ error: 'Aula não encontrada ou sem permissão' });
    }

    // Verify if new student belongs to user
    const student = await db('alunos').where({ id: aluno_id, user_id: userId }).first();
    if (!student) {
      return res.status(403).json({ error: 'Aluno não encontrado ou sem permissão' });
    }

    const horas = calculateHours(hora_inicio, hora_fim);

    await db('aulas').where({ id }).update({
      aluno_id,
      dia_semana: dia_semana || null,
      data: data || null,
      hora_inicio,
      hora_fim,
      horas,
      tipo_treino: tipo_treino || null
    });

    const row = await db('aulas as a')
      .join('alunos as s', 'a.aluno_id', 's.id')
      .where('a.id', id)
      .select('a.*', 's.nome as aluno_nome')
      .first();

    res.json(row);
  } catch (e) {
    console.error('Erro ao atualizar aula:', e);
    res.status(500).json({ error: 'Erro interno' });
  }
};
