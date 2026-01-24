import { db } from '../data/db.js';

export const list = async (req, res) => {
  try {
    const { mes, aluno_id } = req.query;
    
    let query = db('pagamentos as p')
      .join('alunos as a', 'p.aluno_id', 'a.id')
      .select('p.*', 'a.nome as aluno_nome');

    if (mes) { 
      // mes param is YYYY-MM
      const [ano, mesNum] = mes.split('-').map(Number);
      query = query.where({ 'p.mes': mesNum, 'p.ano': ano });
    }
    
    if (aluno_id) { 
      query = query.where('p.aluno_id', aluno_id); 
    }
    
    query = query.orderBy('p.created_at', 'desc');
    
    const rows = await query;
    res.json(rows);
  } catch (e) {
    console.error('Erro ao listar cobranças:', e);
    res.status(500).json({ error: 'Erro interno' });
  }
};

function resolveVencimentoForMonth(s, mesStr) {
  // mesStr is YYYY-MM
  const raw = (s.vencimento || '').toString().trim();
  let day = 5; // default
  // If vencimento in DB is already YYYY-MM-DD (unlikely for "day of month"), parse day
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    day = Number(raw.split('-')[2]);
  } else if (/^\d{1,2}$/.test(raw)) {
    day = Number(raw);
  }
  if (day < 1 || day > 31) day = 5;
  return `${mesStr}-${String(day).padStart(2, '0')}`;
}

export const generateMonthly = async (req, res) => {
  try {
    const { mes } = req.params; // YYYY-MM
    if (!mes) return res.status(400).json({ error: 'Informe o mês no formato YYYY-MM' });

    const [ano, mesNum] = mes.split('-').map(Number);

    const students = await db('alunos').where('status', 'ativo');
    
    let totalCharges = 0;
    
    for (const s of students) {
      // Check if payment already exists for this month/year
      const exists = await db('pagamentos')
        .where({ aluno_id: s.id, mes: mesNum, ano: ano })
        .first();

      if (exists) continue; // Skip if already exists

      let valor = 0;
      const plano = (s.plano || 'mensal').toLowerCase();
      
      if (plano === 'mensal') {
        valor = Number(s.valor || 0);
      } else if (plano === 'semanal') {
        valor = Number(((s.valor || 0) * 4).toFixed(2));
      } else if (plano === 'avulsa' || plano === 'aula avulsa' || plano === 'avulso') {
        // Count classes in that month
        // 'data' in aulas is YYYY-MM-DD
        const monthPrefix = mes; // YYYY-MM
        const result = await db('aulas')
          .count('* as count')
          .where('aluno_id', s.id)
          .andWhere('data', 'like', `${monthPrefix}%`)
          .first();
          
        const aulasNoMes = Number(result.count);
        valor = Number(((s.valor || 0) * aulasNoMes).toFixed(2));
      } else {
        valor = Number(s.valor || 0);
      }

      const vencimento = resolveVencimentoForMonth(s, mes);
      
      await db('pagamentos').insert({
        aluno_id: s.id,
        mes: mesNum,
        ano: ano,
        valor: valor,
        data_vencimento: vencimento,
        status: 'pendente'
      });
      
      totalCharges++;
    }

    res.json({ message: `Cobranças geradas para ${totalCharges} alunos`, mes });
  } catch (e) {
    console.error('Erro ao gerar cobranças:', e);
    res.status(500).json({ error: 'Erro interno' });
  }
};

export const markPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const todayStr = new Date().toISOString().split('T')[0];
    
    const updated = await db('pagamentos')
      .where({ id })
      .update({ 
        status: 'pago',
        data_pagamento: todayStr
      });
      
    if (!updated) return res.status(404).json({ error: 'Cobrança não encontrada' });
    
    const row = await db('pagamentos').where({ id }).first();
    res.json(row);
  } catch (e) {
    console.error('Erro ao marcar cobrança como paga:', e);
    res.status(500).json({ error: 'Erro interno' });
  }
};