import fs from 'fs';
import path from 'path';
import { db } from '../data/db.js';
import { importInitialSpreadsheetIfNeeded } from './import.service.js';

const dataDir = path.resolve(process.cwd(), 'data');
const seedLockPath = path.join(dataDir, 'seed-2026.done');

export const runInitialSeed2026 = async () => {
  try {
    if (fs.existsSync(seedLockPath)) {
      console.log('🔒 Seed 2026 já executado. Pulando.');
      return { seeded: false, reason: 'already_done' };
    }

    console.log('🌱 Iniciando SEED 2026: alunos, agenda e cobranças...');

    // 1) Importar planilhas, se existirem
    const importResult = await importInitialSpreadsheetIfNeeded();

    // 2) Gerar cobranças de 2026 para todos os alunos ativos
    const students = await db('alunos').select('id', 'nome', 'valor', 'vencimento').where('status', 'ativo');
    
    await db.transaction(async (trx) => {
      for (const s of students) {
        const valor = Number(s.valor || 0);
        const day = (() => {
          if (!s.vencimento) return 5; // default dia 5
          const m = String(s.vencimento).match(/(\d{2})$/);
          return m ? Number(m[1]) : 5;
        })();
        
        for (let m = 1; m <= 12; m++) {
          const mesStr = `2026-${String(m).padStart(2, '0')}`; // For SQLite this might just be string, for PG? 
          // The schema uses integer 'mes' and 'ano'.
          // Let's check initSchema in db.js:
          // table.integer('mes').notNullable();
          // table.integer('ano').notNullable();
          // table.string('data_vencimento').notNullable();
          
          // The old code was inserting: mesStr into 'mes'? 
          // Old code: insertCharge.run(s.id, mesStr, valor, vencStr);
          // And the SQL was: INSERT INTO cobrancas (aluno_id, mes, valor_total, vencimento, status) ...
          // Wait, 'cobrancas' table? 
          // In db.js initSchema, the table is 'pagamentos'.
          // Is there a 'cobrancas' table? 
          // Let's check db.js again.
          // It creates 'pagamentos'. 
          // Ah, in charges.controller.js I saw 'pagamentos' being used in my new code, but the old code used 'cobrancas'?
          // Wait, let's check db.js content again.
          // Lines 102-114 create 'pagamentos'.
          // Does it create 'cobrancas'? 
          // I didn't see 'cobrancas' in db.js initSchema output.
          // But charges.controller.js (before my edit) was using 'cobrancas'.
          // And seed2026 (old) uses 'cobrancas'.
          // If 'cobrancas' table doesn't exist in initSchema, then seed2026 would fail anyway!
          // But maybe I missed it in db.js?
          // I will check db.js again very carefully.
          
          // If 'cobrancas' doesn't exist, I should use 'pagamentos'.
          // 'pagamentos' has: aluno_id, valor, data_vencimento, status, mes, ano.
          
          // So I will fix the table name to 'pagamentos' and use correct columns.
          
          const vencStr = `2026-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          
          // Using 'insert' with 'ignore' is tricky in knex cross-db.
          // PG supports ON CONFLICT. SQLite supports OR IGNORE.
          // Simple way: check existence or just insert.
          // Since this is a seed script run once (guaranteed by lock file), maybe we don't need ignore if we trust the lock.
          // But to be safe, we can check.
          
          // But for now, let's just insert into 'pagamentos'.
          
          await trx('pagamentos').insert({
            aluno_id: s.id,
            mes: m,
            ano: 2026,
            valor: valor,
            data_vencimento: vencStr,
            status: 'pendente' // was 'aberto' in seed, but schema default is 'pendente'
          });
        }
      }
    });

    console.log(`💸 Cobranças 2026 geradas para ${students.length} alunos.`);

    // 3) Agenda (removido pois a tabela agenda não existe no schema atual)
    // Se for necessário no futuro, criar a tabela 'agenda' no db.js primeiro.
    
    // Criar lock
    fs.writeFileSync(seedLockPath, new Date().toISOString(), 'utf-8');
    console.log('✅ SEED 2026 concluído.');
    return { seeded: true, students: students.length };
  } catch (e) {
    console.error('❌ Erro no SEED 2026:', e);
    return { seeded: false, error: e.message };
  }
};
