import knex from 'knex';
import path from 'path';
import fs from 'fs';

const isProduction = process.env.NODE_ENV === 'production' || !!process.env.DATABASE_URL;

const config = isProduction 
  ? {
      client: 'pg',
      connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      }
    }
  : {
      client: 'better-sqlite3',
      connection: {
        filename: path.resolve(process.cwd(), 'data', 'app.db')
      },
      useNullAsDefault: true
    };

// Ensure data dir exists for sqlite
if (!isProduction && config.connection.filename) {
    const dataDir = path.dirname(config.connection.filename);
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

export const db = knex(config);

export const hasStudents = async () => {
  try {
    const result = await db('alunos').count('* as count').first();
    // knex .count() returns { count: '5' } or { count: 5 } depending on driver
    return Number(result.count) > 0;
  } catch (e) {
    return false;
  }
};

export const initSchema = async () => {
  try {
    // 1. Users
    if (!(await db.schema.hasTable('users'))) {
      await db.schema.createTable('users', table => {
        table.increments('id');
        table.string('name').notNullable();
        table.string('email').unique().notNullable();
        table.string('password').notNullable();
        table.timestamp('created_at').defaultTo(db.fn.now());
      });
    }

    // 2. Alunos
    if (!(await db.schema.hasTable('alunos'))) {
      await db.schema.createTable('alunos', table => {
        table.increments('id');
        table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.string('nome').notNullable();
        table.string('email');
        table.string('telefone');
        table.string('tipo').notNullable().defaultTo('presencial');
        table.string('plano').notNullable();
        table.float('valor').notNullable();
        table.integer('vencimento');
        table.string('status').notNullable().defaultTo('ativo');
        table.string('mensagem_cobranca');
        table.timestamp('created_at').defaultTo(db.fn.now());
      });
    } else {
      // Migrations
      const hasUserId = await db.schema.hasColumn('alunos', 'user_id');
      if (!hasUserId) await db.schema.alterTable('alunos', t => t.integer('user_id').references('id').inTable('users').onDelete('CASCADE'));
      
      const hasEmail = await db.schema.hasColumn('alunos', 'email');
      if (!hasEmail) await db.schema.alterTable('alunos', t => t.string('email'));
      
      const hasMsg = await db.schema.hasColumn('alunos', 'mensagem_cobranca');
      if (!hasMsg) await db.schema.alterTable('alunos', t => t.string('mensagem_cobranca'));
    }

    // 3. Aulas
    if (!(await db.schema.hasTable('aulas'))) {
      await db.schema.createTable('aulas', table => {
        table.increments('id');
        table.integer('aluno_id').notNullable().references('id').inTable('alunos').onDelete('CASCADE');
        table.string('data'); // YYYY-MM-DD
        table.string('dia_semana');
        table.string('hora_inicio').notNullable();
        table.string('hora_fim').notNullable();
        table.float('horas');
        table.string('tipo_treino');
        table.text('observacoes');
        table.timestamp('created_at').defaultTo(db.fn.now());
      });
    } else {
      const hasData = await db.schema.hasColumn('aulas', 'data');
      if (!hasData) await db.schema.alterTable('aulas', t => t.string('data'));
    }

    // 4. Pagamentos
    if (!(await db.schema.hasTable('pagamentos'))) {
      await db.schema.createTable('pagamentos', table => {
        table.increments('id');
        table.integer('aluno_id').notNullable().references('id').inTable('alunos').onDelete('CASCADE');
        table.float('valor').notNullable();
        table.string('data_vencimento').notNullable();
        table.string('data_pagamento');
        table.string('status').notNullable().defaultTo('pendente');
        table.integer('mes').notNullable();
        table.integer('ano').notNullable();
        table.string('metodo');
        table.timestamp('created_at').defaultTo(db.fn.now());
      });
    } else {
      const hasDataVencimento = await db.schema.hasColumn('pagamentos', 'data_vencimento');
      if (!hasDataVencimento) await db.schema.alterTable('pagamentos', t => t.string('data_vencimento'));

      const hasMes = await db.schema.hasColumn('pagamentos', 'mes');
      if (!hasMes) await db.schema.alterTable('pagamentos', t => t.integer('mes'));

      const hasAno = await db.schema.hasColumn('pagamentos', 'ano');
      if (!hasAno) await db.schema.alterTable('pagamentos', t => t.integer('ano'));

      const hasMetodo = await db.schema.hasColumn('pagamentos', 'metodo');
      if (!hasMetodo) await db.schema.alterTable('pagamentos', t => t.string('metodo'));
    }

    console.log(`✅ Schema initialized (${isProduction ? 'Postgres' : 'SQLite'})`);
  } catch (err) {
    console.error('Schema initialization error:', err);
  }
};
