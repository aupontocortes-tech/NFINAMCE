import { db } from '../data/db.js';

const calculateHours = (start, end) => {
  if (!start || !end) return 0;
  const [h1, m1] = start.split(':').map(Number);
  const [h2, m2] = end.split(':').map(Number);
  const totalH1 = h1 + m1 / 60;
  const totalH2 = h2 + m2 / 60;
  return Number((totalH2 - totalH1).toFixed(2));
};

/** Duração padrão 1h: retorna hora_fim a partir de hora_inicio (ex: "10:00" -> "11:00") */
const addOneHour = (horaInicio) => {
  if (!horaInicio) return null;
  const [h, m] = horaInicio.split(':').map(Number);
  const nextH = (h + 1) % 24;
  return `${String(nextH).padStart(2, '0')}:${String(m ?? 0).padStart(2, '0')}`;
};

/** Verifica se a data (YYYY-MM-DD) é passada em relação a hoje. */
function isDataPassada(data) {
  if (!data) return false;
  const hoje = new Date();
  const y = hoje.getFullYear();
  const m = String(hoje.getMonth() + 1).padStart(2, '0');
  const d = String(hoje.getDate()).padStart(2, '0');
  const hojeStr = `${y}-${m}-${d}`;
  return data < hojeStr;
}

/**
 * Verifica conflito de horário: outro aluno já tem aula no mesmo slot (mesmo dia da semana ou mesma data + hora).
 * Retorna { conflito: true, aluno_nome } se houver conflito.
 */
async function checkConflitoHorario(userId, { dia_semana, data, hora_inicio, excludeAulaId = null, aluno_id }) {
  const q = db('aulas as a')
    .join('alunos as s', 'a.aluno_id', 's.id')
    .where('s.user_id', userId)
    .where('a.hora_inicio', hora_inicio)
    .whereNot('a.aluno_id', aluno_id);
  if (excludeAulaId) q.whereNot('a.id', excludeAulaId);
  if (dia_semana) q.where('a.dia_semana', dia_semana).whereNull('a.data');
  if (data) q.where('a.data', data);
  const existente = await q.select('s.nome as aluno_nome').first();
  return existente ? { conflito: true, aluno_nome: existente.aluno_nome } : { conflito: false };
}

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

/**
 * Cria uma ou várias aulas.
 * Aceita: dia_semana (string), data (string), dias_semana (array), datas (array).
 * - dias_semana: cria aula recorrente para cada dia (ex: ["seg","ter"]).
 * - datas: cria aula pontual para cada data (ex: ["2025-01-20","2025-01-22"]).
 * Valida: data passada e conflito de horário antes de salvar.
 */
export const create = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      aluno_id,
      dia_semana,
      data,
      dias_semana,
      datas,
      hora_inicio,
      hora_fim,
      tipo_treino,
      tipo_treino_por_dia,
      status = 'confirmada',
      tipo_aula = 'fixa',
    } = req.body;

    if (!aluno_id || !hora_inicio) {
      return res.status(400).json({ error: 'Campos obrigatórios: aluno_id e hora_inicio' });
    }

    // Monta lista de slots: cada um é { dia_semana?, data? }
    const slots = [];
    if (dias_semana && Array.isArray(dias_semana) && dias_semana.length > 0) {
      for (const d of dias_semana) {
        if (d) slots.push({ dia_semana: d, data: null });
      }
    } else if (datas && Array.isArray(datas) && datas.length > 0) {
      for (const dt of datas) {
        if (dt) slots.push({ dia_semana: null, data: dt });
      }
    } else if (dia_semana) {
      slots.push({ dia_semana, data: null });
    } else if (data) {
      slots.push({ dia_semana: null, data: data });
    }

    if (slots.length === 0) {
      return res.status(400).json({
        error: 'Informe dias da semana (recorrente) ou datas específicas (pontual)',
      });
    }

    const student = await db('alunos').where({ id: aluno_id, user_id: userId }).first();
    if (!student) {
      return res.status(403).json({ error: 'Aluno não encontrado ou sem permissão' });
    }

    const hora_fim_final = hora_fim || addOneHour(hora_inicio);
    const horas = calculateHours(hora_inicio, hora_fim_final);

    // Valida cada slot: data passada e conflito
    for (const slot of slots) {
      if (slot.data && isDataPassada(slot.data)) {
        return res.status(400).json({
          code: 'DATA_PASSADA',
          error: `Não é possível agendar em data passada (${slot.data}).`,
        });
      }
      const conflito = await checkConflitoHorario(userId, {
        dia_semana: slot.dia_semana,
        data: slot.data,
        hora_inicio,
        aluno_id,
      });
      if (conflito.conflito) {
        return res.status(409).json({
          code: 'CONFLITO_HORARIO',
          error: `Horário já ocupado por ${conflito.aluno_nome}. Escolha outro horário ou dia.`,
        });
      }
    }

    // Tipo por dia (tabela Seg-Dom): usa tipo_treino_por_dia[dia_semana] ou tipo_treino
    const getTipoTreinoForSlot = (slot) => {
      if (slot.data) return tipo_treino || null;
      const porDia = tipo_treino_por_dia && typeof tipo_treino_por_dia === 'object' ? tipo_treino_por_dia : null;
      const t = porDia && slot.dia_semana ? (porDia[slot.dia_semana] || tipo_treino) : tipo_treino;
      return t || null;
    };

    // Insere uma aula por slot
    const created = [];
    for (const slot of slots) {
      const [inserted] = await db('aulas')
        .insert({
          aluno_id,
          dia_semana: slot.dia_semana || null,
          data: slot.data || null,
          hora_inicio,
          hora_fim: hora_fim_final,
          horas,
          tipo_treino: getTipoTreinoForSlot(slot),
          status,
          tipo_aula: slot.data ? 'pontual' : 'fixa',
        })
        .returning('*');
      if (inserted) {
        const row = await db('aulas as a')
          .join('alunos as s', 'a.aluno_id', 's.id')
          .where('a.id', inserted.id)
          .select('a.*', 's.nome as aluno_nome')
          .first();
        if (row) created.push(row);
      }
    }

    if (created.length === 0) {
      return res.status(500).json({ error: 'Erro ao salvar aulas' });
    }
    // Retorna array se criou várias; objeto único se criou uma (compatibilidade)
    if (created.length === 1) {
      return res.status(201).json(created[0]);
    }
    return res.status(201).json(created);
  } catch (e) {
    console.error('Erro ao criar aula:', e);
    res.status(500).json({ error: 'Erro interno' });
  }
};

/**
 * GET /aulas/check-conflict?dia_semana=&data=&hora_inicio=&aluno_id=
 * Verifica se há conflito (e se data é passada) antes de salvar.
 */
export const checkConflict = async (req, res) => {
  try {
    const userId = req.user.id;
    const { dia_semana, data, hora_inicio, aluno_id } = req.query;
    if (!hora_inicio) {
      return res.status(400).json({ error: 'hora_inicio é obrigatório' });
    }
    if (!dia_semana && !data) {
      return res.status(400).json({ error: 'Informe dia_semana ou data' });
    }
    if (data && isDataPassada(data)) {
      return res.json({ ok: false, code: 'DATA_PASSADA', message: 'Não é possível agendar em data passada.' });
    }
    const conflito = await checkConflitoHorario(userId, {
      dia_semana: dia_semana || null,
      data: data || null,
      hora_inicio,
      aluno_id: aluno_id || 0,
    });
    if (conflito.conflito) {
      return res.json({
        ok: false,
        code: 'CONFLITO_HORARIO',
        message: `Horário já ocupado por ${conflito.aluno_nome}.`,
      });
    }
    return res.json({ ok: true });
  } catch (e) {
    console.error('Erro ao verificar conflito:', e);
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
    const { aluno_id, dia_semana, data, hora_inicio, hora_fim, tipo_treino, status } = req.body;

    const existingAula = await db('aulas as a')
      .join('alunos as s', 'a.aluno_id', 's.id')
      .where('a.id', id)
      .where('s.user_id', userId)
      .select('a.*')
      .first();

    if (!existingAula) {
      return res.status(404).json({ error: 'Aula não encontrada ou sem permissão' });
    }

    const updates = {};

    if (status !== undefined) {
      if (!['confirmada', 'remarcada', 'cancelada'].includes(status)) {
        return res.status(400).json({ error: 'Status deve ser: confirmada, remarcada ou cancelada' });
      }
      updates.status = status;
    }

    if (aluno_id !== undefined) {
      const student = await db('alunos').where({ id: aluno_id, user_id: userId }).first();
      if (!student) return res.status(403).json({ error: 'Aluno não encontrado ou sem permissão' });
      updates.aluno_id = aluno_id;
    }
    if (dia_semana !== undefined) updates.dia_semana = dia_semana || null;
    if (data !== undefined) {
      if (data && isDataPassada(data)) {
        return res.status(400).json({ code: 'DATA_PASSADA', error: 'Não é possível agendar em data passada.' });
      }
      updates.data = data || null;
    }
    if (hora_inicio !== undefined) {
      const hora_fim_new = hora_fim || addOneHour(hora_inicio);
      const conflito = await checkConflitoHorario(userId, {
        dia_semana: updates.dia_semana ?? existingAula.dia_semana,
        data: updates.data ?? existingAula.data,
        hora_inicio,
        excludeAulaId: id,
        aluno_id: updates.aluno_id ?? existingAula.aluno_id,
      });
      if (conflito.conflito) {
        return res.status(409).json({
          code: 'CONFLITO_HORARIO',
          error: `Horário já ocupado por ${conflito.aluno_nome}.`,
        });
      }
      updates.hora_inicio = hora_inicio;
      updates.hora_fim = hora_fim_new;
      updates.horas = calculateHours(hora_inicio, hora_fim_new);
    } else if (hora_fim !== undefined) {
      updates.hora_fim = hora_fim;
      updates.horas = calculateHours(existingAula.hora_inicio, hora_fim);
    }
    if (tipo_treino !== undefined) updates.tipo_treino = tipo_treino || null;
    if (status === 'remarcada' && (data || hora_inicio)) updates.tipo_aula = 'remarcada';

    if (Object.keys(updates).length === 0) {
      const row = await db('aulas as a')
        .join('alunos as s', 'a.aluno_id', 's.id')
        .where('a.id', id)
        .select('a.*', 's.nome as aluno_nome')
        .first();
      return res.json(row);
    }

    await db('aulas').where({ id }).update(updates);

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
