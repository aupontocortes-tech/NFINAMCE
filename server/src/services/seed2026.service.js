import fs from 'fs';
import path from 'path';
import { db } from '../data/db.js';
import { importInitialSpreadsheetIfNeeded } from './import.service.js';

const dataDir = path.resolve(process.cwd(), 'data');
const seedLockPath = path.join(dataDir, 'seed-2026.done');

export const runInitialSeed2026 = () => {
  try {
    if (fs.existsSync(seedLockPath)) {
      console.log('🔒 Seed 2026 já executado. Pulando.');
      return { seeded: false, reason: 'already_done' };
    }

    console.log('🌱 Iniciando SEED 2026: alunos, agenda e cobranças...');

    // 1) Importar planilhas, se existirem
    const importResult = importInitialSpreadsheetIfNeeded();

    // 2) Gerar cobranças de 2026 para todos os alunos ativos
    const students = db.prepare(`SELECT id, nome, valor, vencimento FROM alunos WHERE status = 'ativo'`).all();
    const insertCharge = db.prepare(`INSERT OR IGNORE INTO cobrancas (aluno_id, mes, valor_total, vencimento, status) VALUES (?, ?, ?, ?, 'aberto')`);

    const txCharges = db.transaction(() => {
      for (const s of students) {
        const valor = Number(s.valor || 0);
        const day = (() => {
          if (!s.vencimento) return 5; // default dia 5
          const m = String(s.vencimento).match(/(\d{2})$/);
          return m ? Number(m[1]) : 5;
        })();
        for (let m = 1; m <= 12; m++) {
          const mesStr = `2026-${String(m).padStart(2, '0')}`;
          const vencStr = `2026-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          insertCharge.run(s.id, mesStr, valor, vencStr);
        }
      }
    });
    txCharges();
    console.log(`💸 Cobranças 2026 geradas para ${students.length} alunos.`);

    // 3) Popular tabela 'agenda' com slots únicos (dia_semana + horário) derivados de aulas recorrentes
    const recurring = db.prepare(`SELECT DISTINCT dia_semana, hora_inicio, hora_fim FROM aulas WHERE dia_semana IS NOT NULL`).all();
    const insertAgenda = db.prepare(`INSERT OR IGNORE INTO agenda (dia_semana, hora_inicio, hora_fim, observacoes) VALUES (?, ?, ?, NULL)`);
    const txAgenda = db.transaction(() => {
      for (const r of recurring) {
        if (!r.dia_semana || !r.hora_inicio || !r.hora_fim) continue;
        insertAgenda.run(r.dia_semana, r.hora_inicio, r.hora_fim);
      }
    });
    txAgenda();
    console.log(`📅 Agenda base preenchida com ${recurring.length} slots.`);

    // Criar lock
    fs.writeFileSync(seedLockPath, new Date().toISOString(), 'utf-8');
    console.log('✅ SEED 2026 concluído.');
    return { seeded: true, students: students.length, agendaSlots: recurring.length };
  } catch (e) {
    console.error('❌ Erro no SEED 2026:', e);
    return { seeded: false, error: e.message };
  }
};