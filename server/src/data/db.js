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

export const hasStudents = () => {
  try {
    const row = db.prepare('SELECT count(*) as count FROM alunos').get();
    return row.count > 0;
  } catch (e) {
    return false;
  }
};

export const initSchema = () => {
  // 1. Users (Professores)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // 2. Alunos (Students)
  db.exec(`
    CREATE TABLE IF NOT EXISTS alunos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      nome TEXT NOT NULL,
      email TEXT,
      telefone TEXT,
      tipo TEXT NOT NULL DEFAULT 'presencial',
      plano TEXT NOT NULL,
      valor REAL NOT NULL,
      vencimento INTEGER, -- Dia do vencimento (1-31)
      status TEXT NOT NULL DEFAULT 'ativo',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Migration: Add user_id to alunos if missing
  if (!columnExists('alunos', 'user_id')) {
    try {
      db.exec(`ALTER TABLE alunos ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE`);
    } catch (e) {
      console.error('Migration Error (alunos.user_id):', e.message);
    }
  }
  // Migration: Add email to alunos if missing
  if (!columnExists('alunos', 'email')) {
    try {
      db.exec(`ALTER TABLE alunos ADD COLUMN email TEXT`);
    } catch (e) { console.error('Migration Error (alunos.email):', e.message); }
  }

  // Migration: Add data column to aulas if missing
  if (!columnExists('aulas', 'data')) {
    try {
      db.exec(`ALTER TABLE aulas ADD COLUMN data TEXT`);
    } catch (e) { console.error('Migration Error (aulas.data):', e.message); }
  }

  // Migration: Add mensagem_cobranca to alunos if missing
  if (!columnExists('alunos', 'mensagem_cobranca')) {
    try {
      db.exec(`ALTER TABLE alunos ADD COLUMN mensagem_cobranca TEXT`);
    } catch (e) { console.error('Migration Error (alunos.mensagem_cobranca):', e.message); }
  }

   // Migration: Change vencimento to INTEGER if it was TEXT (Hard to migrate type in SQLite without recreate, let's just ensure new col or use logic)
   // We will assume 'vencimento' exists. If it was text date, we might need logic change.
   // For now, let's keep it flexible.

  // 3. Aulas (Classes)
  db.exec(`
    CREATE TABLE IF NOT EXISTS aulas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      aluno_id INTEGER NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
      data TEXT, -- YYYY-MM-DD for specific date
      dia_semana TEXT, -- 'seg', 'ter', etc for recurring
      hora_inicio TEXT NOT NULL,
      hora_fim TEXT NOT NULL,
      horas REAL,
      tipo_treino TEXT DEFAULT NULL,
      observacoes TEXT DEFAULT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // 4. Pagamentos / Cobrancas
  // Re-aligning with "Pagamentos" requirement: aluno_id, valor, data_vencimento, status, mes, ano
  db.exec(`
    CREATE TABLE IF NOT EXISTS pagamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      aluno_id INTEGER NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
      valor REAL NOT NULL,
      data_vencimento TEXT NOT NULL, -- YYYY-MM-DD
      data_pagamento TEXT, -- YYYY-MM-DD (NULL if pending)
      status TEXT NOT NULL DEFAULT 'pendente', -- pendente, pago, atrasado
      mes INTEGER NOT NULL,
      ano INTEGER NOT NULL,
      metodo TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
  
  // Note: We are leaving 'cobrancas' table from V2 for now to avoid data loss, but V3 should prefer 'pagamentos'.
  // We can eventually migrate.

  console.log('✅ Schema initialized (V3 Multi-tenant)');
};
