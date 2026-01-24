import { db, hasStudents } from '../data/db.js';
import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';

function normalizeRow(row) {
  return {
    nome: (row.nome || row.aluno || row.name || '').trim(),
    telefone: (row.telefone || row.phone || '').trim(),
    valor: Number(row.valor || row.preco || row.price || 0),
    plano: (row.plano || row.tipo || row.plan || 'mensal').toLowerCase(),
    status: (row.status || 'ativo').toLowerCase(),
  };
}

function readSpreadsheet(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return xlsx.utils.sheet_to_json(sheet, { defval: '' });
}

export async function importInitialSpreadsheetIfNeeded(projectRoot = process.cwd()) {
  if (await hasStudents()) return { imported: 0, schedules: 0 };
  const expectedDir = path.join(projectRoot, 'data');
  const possibleFiles = ['alunos.xlsx', 'alunos.csv'];
  const foundFile = possibleFiles.find((f) => fs.existsSync(path.join(expectedDir, f)));

  if (!foundFile) return { imported: 0, schedules: 0 };

  const filePath = path.join(expectedDir, foundFile);
  const rows = readSpreadsheet(filePath).map(normalizeRow).filter((r) => r.nome);

  await db.transaction(async (trx) => {
    for (const r of rows) {
      await trx('alunos').insert({
        nome: r.nome,
        telefone: r.telefone,
        plano: r.plano,
        valor: r.valor,
        status: r.status
      });
    }
  });

  const schedResult = await importSchedulesIfFound(projectRoot);
  return { imported: rows.length, schedules: schedResult };
}

async function importSchedulesIfFound(projectRoot = process.cwd()) {
  const dir = path.join(projectRoot, 'data');
  const possibleScheduleFiles = ['aulas.xlsx', 'horarios.xlsx', 'agenda.xlsx', 'classes.xlsx'];
  const file = possibleScheduleFiles.find((f) => fs.existsSync(path.join(dir, f)));
  if (!file) return 0;
  const fp = path.join(dir, file);
  const rows = readSpreadsheet(fp);

  const students = await db('alunos').select('id', 'nome');
  const studentsByName = new Map(
    students.map((s) => [s.nome.trim().toLowerCase(), s.id])
  );

  let count = 0;
  await db.transaction(async (trx) => {
    for (const r of rows) {
      const nome = (r.nome || r.aluno || '').trim().toLowerCase();
      const alunoId = studentsByName.get(nome);
      if (!alunoId) continue;
      const data = r.data || r.date || '';
      const horas = Number(r.horas || r.duracao || r.duration || 1);
      const descricao = (r.descricao || r.obs || '').trim();
      
      await trx('aulas').insert({
        aluno_id: alunoId,
        data: data,
        horas: horas, // check schema if 'horas' or 'descricao' columns match. Schema has 'horas' (float), 'observacoes' (text).
        observacoes: descricao
        // Note: schema has 'data', 'hora_inicio', 'hora_fim'. import seems to rely on 'data' and 'horas'? 
        // Checking initSchema: 'horas' float, 'observacoes' text. 'data' string.
      });
      count++;
    }
  });

  return count;
}