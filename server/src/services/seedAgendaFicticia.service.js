import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { db } from '../data/db.js';

const dataDir = path.resolve(process.cwd(), 'data');
const seedLockPath = path.join(dataDir, 'seed-agenda-ficticia.done');

/** Formata data em YYYY-MM-DD no fuso local (igual ao frontend) */
function toYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Segunda a sábado da semana atual (mesmo critério do frontend) */
function getWeekDates() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  const dates = [];
  for (let d = 0; d < 7; d++) {
    const d2 = new Date(monday);
    d2.setDate(monday.getDate() + d);
    const key = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'][d2.getDay()];
    dates.push({ date: d2, key, ymd: toYMD(d2) });
  }
  return dates;
}

const DEMO_EMAIL = 'demo@nfinance.com';
const DEMO_PASSWORD = 'demo123';

/**
 * Em desenvolvimento: garante que o usuário demo existe e a senha é demo123.
 * Roda a cada startup para você sempre conseguir entrar com demo@nfinance.com / demo123.
 */
export const ensureDemoUser = async () => {
  if (process.env.DATABASE_URL) return;
  try {
    const demo = await db('users').where({ email: DEMO_EMAIL }).first();
    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
    if (!demo) {
      await db('users').insert({
        name: 'Demo',
        email: DEMO_EMAIL,
        password: hashedPassword,
      });
      console.log('   ✅ Usuário demo criado: demo@nfinance.com / demo123');
    } else {
      await db('users').where({ email: DEMO_EMAIL }).update({ password: hashedPassword });
      console.log('   ✅ Senha demo atualizada: demo@nfinance.com / demo123');
    }
  } catch (e) {
    console.error('   Erro ao garantir usuário demo:', e.message);
  }
};

/** Lista dos 6 alunos fictícios para teste (nome, dias_fixos, hora_fixo_inicio) */
const ALUNOS_FICTICIOS = [
  { nome: 'Ana Silva', dias_fixos: 'seg,qua,sex', hora_fixo_inicio: '08:00' },
  { nome: 'Pedro Ramos', dias_fixos: 'ter,qui', hora_fixo_inicio: '09:00' },
  { nome: 'Lucas Souza', dias_fixos: 'seg,qua', hora_fixo_inicio: '10:00' },
  { nome: 'João Lima', dias_fixos: 'ter,sex', hora_fixo_inicio: '07:00' },
  { nome: 'Maria Santos', dias_fixos: 'qui,sab', hora_fixo_inicio: '06:00' },
  { nome: 'Carlos Oliveira', dias_fixos: 'seg,ter,sex', hora_fixo_inicio: '14:00' },
];

/**
 * Em desenvolvimento: garante que o usuário demo tem os 6 alunos fictícios para testar a agenda.
 * Se faltar algum, cria. Roda a cada startup para você sempre ter dados para testar.
 */
export const ensureAlunosFicticios = async () => {
  if (process.env.DATABASE_URL) return;
  try {
    const demoUser = await db('users').where({ email: DEMO_EMAIL }).first();
    if (!demoUser) return;
    const userId = demoUser.id;
    const existing = await db('alunos').where({ user_id: userId }).select('nome');
    const existingNames = new Set((existing || []).map((r) => r.nome));
    const toCreate = ALUNOS_FICTICIOS.filter((a) => !existingNames.has(a.nome));
    if (toCreate.length === 0) return;

    console.log(`   📋 Garantindo ${toCreate.length} aluno(s) fictício(s) para teste...`);
    const weekDates = getWeekDates();
    const addHora = (horaInicio) => {
      const [h] = horaInicio.split(':').map(Number);
      return `${String((h + 1) % 24).padStart(2, '0')}:00`;
    };

    for (const a of toCreate) {
      const [row] = await db('alunos')
        .insert({
          user_id: userId,
          nome: a.nome,
          email: null,
          telefone: null,
          tipo: 'presencial',
          plano: 'mensal',
          valor: 150,
          vencimento: 5,
          status: 'ativo',
          dias_fixos: a.dias_fixos,
          hora_fixo_inicio: a.hora_fixo_inicio,
        })
        .returning('*');
      const aluno = row ?? await db('alunos').where({ user_id: userId, nome: a.nome }).first();
      if (aluno) {
        const dias = (a.dias_fixos || '').split(',').map((d) => d.trim()).filter(Boolean);
        const horaInicio = a.hora_fixo_inicio || '09:00';
        const horaFim = addHora(horaInicio);
        for (const w of weekDates) {
          if (w.key === 'dom' || !dias.includes(w.key)) continue;
          await db('aulas').insert({
            aluno_id: aluno.id,
            data: w.ymd,
            dia_semana: w.key,
            hora_inicio: horaInicio,
            hora_fim: horaFim,
            horas: 1,
            tipo_treino: null,
            status: 'confirmada',
            tipo_aula: 'fixa',
          });
        }
      }
    }
    console.log(`   ✅ Alunos fictícios prontos para testar a agenda.`);
  } catch (e) {
    console.error('   Erro ao garantir alunos fictícios:', e.message);
  }
};

export const runSeedAgendaFicticia = async () => {
  if (process.env.DATABASE_URL) {
    return { seeded: false, reason: 'production' };
  }
  try {
    await ensureDemoUser();
    await ensureAlunosFicticios();

    if (fs.existsSync(seedLockPath)) {
      console.log('🔒 Seed agenda fictícia já executado. Pulando.');
      return { seeded: false, reason: 'already_done' };
    }

    console.log('🌱 Seed agenda fictícia: criando alunos e aulas...');

    const demoUser = await db('users').where({ email: DEMO_EMAIL }).first();
    const userId = demoUser?.id ?? (await db('users').first())?.id;
    if (!userId) {
      console.log('   Nenhum usuário no banco. O ensureDemoUser já criou o demo.');
      return { seeded: false, reason: 'no_user' };
    }

    const alunosFicticios = ALUNOS_FICTICIOS;

    const insertedAlunos = [];
    for (const a of alunosFicticios) {
      const [row] = await db('alunos')
        .insert({
          user_id: userId,
          nome: a.nome,
          email: null,
          telefone: null,
          tipo: 'presencial',
          plano: 'mensal',
          valor: 150,
          vencimento: 5,
          status: 'ativo',
          dias_fixos: a.dias_fixos,
          hora_fixo_inicio: a.hora_fixo_inicio,
        })
        .returning('*');
      const aluno = row ?? await db('alunos').where({ user_id: userId, nome: a.nome }).first();
      if (aluno) insertedAlunos.push({ id: aluno.id, nome: aluno.nome, dias_fixos: a.dias_fixos, hora_fixo_inicio: a.hora_fixo_inicio });
    }

    const weekDates = getWeekDates();
    let totalAulas = 0;

    const addHora = (horaInicio) => {
      const [h] = horaInicio.split(':').map(Number);
      return `${String((h + 1) % 24).padStart(2, '0')}:00`;
    };

    // Aulas fixas: cada aluno nos seus dias no horário marcado
    for (const aluno of insertedAlunos) {
      const dias = (aluno.dias_fixos || '').split(',').map((d) => d.trim()).filter(Boolean);
      const horaInicio = aluno.hora_fixo_inicio || '09:00';
      const horaFim = addHora(horaInicio);

      for (const w of weekDates) {
        if (w.key === 'dom') continue;
        if (!dias.includes(w.key)) continue;
        await db('aulas').insert({
          aluno_id: aluno.id,
          data: w.ymd,
          dia_semana: w.key,
          hora_inicio: horaInicio,
          hora_fim: horaFim,
          horas: 1,
          tipo_treino: null,
          status: 'confirmada',
          tipo_aula: 'fixa',
        });
        totalAulas++;
      }
    }

    // Horários extras na mesma semana para encher a grade (outros horários marcados)
    const extras = [
      { alunoIdx: 0, diaKey: 'seg', hora: '11:00' },
      { alunoIdx: 1, diaKey: 'ter', hora: '15:00' },
      { alunoIdx: 2, diaKey: 'qua', hora: '16:00' },
      { alunoIdx: 3, diaKey: 'sex', hora: '08:00' },
      { alunoIdx: 4, diaKey: 'sab', hora: '09:00' },
      { alunoIdx: 5, diaKey: 'seg', hora: '17:00' },
    ];
    for (const ex of extras) {
      const aluno = insertedAlunos[ex.alunoIdx];
      if (!aluno) continue;
      const w = weekDates.find((x) => x.key === ex.diaKey);
      if (!w) continue;
      await db('aulas').insert({
        aluno_id: aluno.id,
        data: w.ymd,
        dia_semana: ex.diaKey,
        hora_inicio: ex.hora,
        hora_fim: addHora(ex.hora),
        horas: 1,
        tipo_treino: null,
        status: 'remarcada',
        tipo_aula: 'remarcada',
      });
      totalAulas++;
    }

    // Uma aula cancelada para ver a cor na legenda
    const seg = weekDates.find((w) => w.key === 'seg');
    if (seg && insertedAlunos[1]) {
      await db('aulas').insert({
        aluno_id: insertedAlunos[1].id,
        data: seg.ymd,
        dia_semana: 'seg',
        hora_inicio: '13:00',
        hora_fim: '14:00',
        horas: 1,
        tipo_treino: null,
        status: 'cancelada',
        tipo_aula: 'fixa',
      });
      totalAulas++;
    }

    fs.writeFileSync(seedLockPath, new Date().toISOString(), 'utf-8');
    console.log(`✅ Agenda fictícia: ${insertedAlunos.length} alunos, ${totalAulas} aulas. Login: demo@nfinance.com / demo123`);
    return { seeded: true, alunos: insertedAlunos.length, aulas: totalAulas };
  } catch (e) {
    console.error('❌ Erro no seed agenda fictícia:', e);
    return { seeded: false, error: e.message };
  }
};
