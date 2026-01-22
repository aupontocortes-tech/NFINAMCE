import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'app.db');
export const db = new Database(dbPath);

// Enable foreign keys
try {
  db.pragma('foreign_keys = ON');
} catch {}

function columnExists(table, column) {
  try {
    const rows = db.prepare(`PRAGMA table_info(${table})`).all();
    return rows.some(r => r.name === column);
  } catch {
    return false;
  }
}

export const initSchema = () => {
  // Base tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS alunos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      telefone TEXT,
      tipo TEXT NOT NULL DEFAULT 'presencial',
      plano TEXT NOT NULL,
      valor REAL NOT NULL,
      vencimento TEXT,
      status TEXT NOT NULL DEFAULT 'ativo'
    );

    CREATE TABLE IF NOT EXISTS aulas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      aluno_id INTEGER NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
      data TEXT,
      dia_semana TEXT DEFAULT NULL,
      hora_inicio TEXT NOT NULL,
      hora_fim TEXT NOT NULL,
      horas REAL NOT NULL,
      tipo_treino TEXT DEFAULT NULL,
      observacoes TEXT DEFAULT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS agenda (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dia_semana TEXT NOT NULL,
      hora_inicio TEXT NOT NULL,
      hora_fim TEXT NOT NULL,
      observacoes TEXT DEFAULT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cobrancas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      aluno_id INTEGER NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
      mes TEXT NOT NULL,
      valor_total REAL NOT NULL,
      vencimento TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'aberto',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pagamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cobranca_id INTEGER NOT NULL REFERENCES cobrancas(id) ON DELETE CASCADE,
      valor REAL NOT NULL,
      data TEXT NOT NULL DEFAULT (datetime('now')),
      metodo TEXT DEFAULT NULL
    );

    CREATE TABLE IF NOT EXISTS reposicoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      aluno_id INTEGER NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
      related_aula_id INTEGER REFERENCES aulas(id) ON DELETE SET NULL,
      data TEXT NOT NULL,
      hora_inicio TEXT NOT NULL,
      hora_fim TEXT NOT NULL,
      motivo TEXT DEFAULT NULL,
      status TEXT NOT NULL DEFAULT 'reposicao',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Migrate old cobrancas schema (funcionario_id -> aluno_id)
  const hasAlunoId = columnExists('cobrancas', 'aluno_id');
  const hasFuncionarioId = columnExists('cobrancas', 'funcionario_id');
  if (!hasAlunoId && hasFuncionarioId) {
    db.transaction(() => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS cobrancas_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          aluno_id INTEGER NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
          mes TEXT NOT NULL,
          valor_total REAL NOT NULL,
          vencimento TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'aberto',
          created_at TEXT DEFAULT (datetime('now'))
        );
      `);
      // Fallback vencimento to '2000-01-05' if missing
      const hasOldVenc = columnExists('cobrancas', 'vencimento');
      if (hasOldVenc) {
        db.exec(`
          INSERT INTO cobrancas_new (aluno_id, mes, valor_total, vencimento, status, created_at)
          SELECT funcionario_id, mes, valor_total,
                 COALESCE(vencimento, '2000-01-05'), status, created_at
          FROM cobrancas;
        `);
      } else {
        db.exec(`
          INSERT INTO cobrancas_new (aluno_id, mes, valor_total, vencimento, status, created_at)
          SELECT funcionario_id, mes, valor_total,
                 '2000-01-05' as vencimento, status, created_at
          FROM cobrancas;
        `);
      }
      db.exec('DROP TABLE cobrancas;');
      db.exec('ALTER TABLE cobrancas_new RENAME TO cobrancas;');
    })();
  }

  // Indexes
  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_alunos_nome ON alunos(nome);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_cobrancas_aluno_mes ON cobrancas(aluno_id, mes);
    CREATE INDEX IF NOT EXISTS idx_aulas_lookup ON aulas(aluno_id, data, dia_semana, hora_inicio);
    CREATE INDEX IF NOT EXISTS idx_reposicoes_lookup ON reposicoes(aluno_id, data);
  `);
};

export const calculateHours = (start, end) => {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  let diff = (endMin - startMin) / 60;
  if (diff < 0) diff += 24;
  return Number(diff.toFixed(2));
};

export const hasStudents = () => {
  const row = db.prepare('SELECT COUNT(1) as c FROM alunos').get();
  return (row?.c || 0) > 0;
};