import { db } from '../data/db.js';

export const list = async (req, res) => {
  const userId = req.user.id;
  try {
    const rows = await db('alunos').where({ user_id: userId }).orderBy('nome');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar alunos:', error);
    res.status(500).json({ error: 'Erro ao listar alunos.' });
  }
};

export const create = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { nome, email, telefone, valor, plano, status, vencimento, customMessage } = req.body;
    
    if (!nome || valor === undefined) {
      return res.status(400).json({ error: 'Campos obrigatórios: nome, valor' });
    }

    const alunoData = {
        user_id: userId,
        nome,
        email: email || null,
        telefone: telefone || '',
        valor: Number(valor),
        plano: (plano || 'mensal').toLowerCase(),
        vencimento: (vencimento ?? 5),
        status: status || 'ativo',
        mensagem_cobranca: customMessage || null
    };

    // Insert and get result
    // Knex .returning('*') works for PG. For SQLite it depends on support.
    const [inserted] = await db('alunos').insert(alunoData).returning('*');
    
    let aluno = inserted;
    // Fallback for SQLite if it returns just ID or nothing (though recent knex/better-sqlite3 supports returning)
    if (!aluno || typeof aluno === 'number' || typeof aluno === 'string') {
        if (typeof inserted === 'number' || typeof inserted === 'string') {
            aluno = await db('alunos').where({ id: inserted }).first();
        } else {
             // Try to find the latest for this user
             aluno = await db('alunos').where({ user_id: userId }).orderBy('id', 'desc').first();
        }
    }
    
    // Criar pagamento pendente para o mês atual
    try {
      const today = new Date();
      const mes = today.getMonth() + 1; // 1-12
      const ano = today.getFullYear();
      
      // Data de vencimento baseada no dia escolhido
      const diaVenc = aluno.vencimento || 5;
      const dataVencimento = new Date(ano, mes - 1, diaVenc).toISOString().split('T')[0];

      await db('pagamentos').insert({
        aluno_id: aluno.id,
        valor: Number(aluno.valor),
        data_vencimento: dataVencimento,
        status: 'pendente',
        mes,
        ano
      });
    } catch (chargeErr) {
      console.error('Aviso: Falha ao criar pagamento inicial:', chargeErr.message);
    }

    res.status(201).json(aluno);
  } catch (e) {
    console.error('Erro ao criar aluno:', e);
    res.status(500).json({ error: e.message || 'Erro interno' });
  }
};

export const update = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  try {
      const existing = await db('alunos').where({ id, user_id: userId }).first();
      if (!existing) return res.status(404).json({ error: 'Aluno não encontrado' });
      
      const { nome, email, telefone, valor, plano, status, vencimento, customMessage } = req.body;
      
      const updateData = {
          nome: nome ?? existing.nome,
          email: email ?? existing.email,
          telefone: telefone ?? existing.telefone,
          valor: valor ?? existing.valor,
          plano: (plano ?? existing.plano),
          vencimento: (vencimento ?? existing.vencimento),
          status: status ?? existing.status,
          mensagem_cobranca: customMessage !== undefined ? customMessage : existing.mensagem_cobranca
      };

      await db('alunos').where({ id, user_id: userId }).update(updateData);
        
      const row = await db('alunos').where({ id }).first();
      res.json(row);
  } catch (e) {
      console.error('Erro ao atualizar aluno:', e);
      res.status(500).json({ error: 'Erro ao atualizar aluno' });
  }
};

export const remove = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  try {
      const count = await db('alunos').where({ id, user_id: userId }).del();
      if (count === 0) return res.status(404).json({ error: 'Aluno não encontrado' });
      res.status(204).send();
  } catch (e) {
      console.error('Erro ao remover aluno:', e);
      res.status(500).json({ error: 'Erro ao remover aluno' });
  }
};
