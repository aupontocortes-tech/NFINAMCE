import { db } from '../data/db.js';

export const list = (req, res) => {
  const userId = req.user.id;
  const rows = db.prepare('SELECT * FROM alunos WHERE user_id = ? ORDER BY nome').all(userId);
  res.json(rows);
};

export const create = (req, res) => {
  try {
    const userId = req.user.id;
    
    // Verificar limite de 3 alunos
    const count = db.prepare('SELECT COUNT(*) as count FROM alunos WHERE user_id = ?').get(userId).count;
    if (count >= 3) {
      return res.status(403).json({ error: 'Limite de 3 alunos atingido no plano gratuito.' });
    }

    const { nome, email, telefone, valor, plano, status, vencimento, customMessage } = req.body;
    
    if (!nome || valor === undefined) {
      return res.status(400).json({ error: 'Campos obrigatórios: nome, valor' });
    }

    const info = db.prepare(`
      INSERT INTO alunos (user_id, nome, email, telefone, valor, plano, vencimento, status, mensagem_cobranca) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      nome, 
      email || null, 
      telefone || '', 
      Number(valor), 
      (plano || 'mensal').toLowerCase(), 
      (vencimento ?? 5), 
      status || 'ativo',
      customMessage || null
    );
    
    const aluno = db.prepare('SELECT * FROM alunos WHERE id = ?').get(info.lastInsertRowid);
    
    // Criar pagamento pendente para o mês atual
    try {
      const today = new Date();
      const mes = today.getMonth() + 1; // 1-12
      const ano = today.getFullYear();
      
      // Data de vencimento baseada no dia escolhido
      const diaVenc = aluno.vencimento || 5;
      const dataVencimento = new Date(ano, mes - 1, diaVenc).toISOString().split('T')[0];

      db.prepare(`
        INSERT INTO pagamentos (aluno_id, valor, data_vencimento, status, mes, ano) 
        VALUES (?, ?, ?, 'pendente', ?, ?)
      `).run(aluno.id, Number(aluno.valor), dataVencimento, mes, ano);
    } catch (chargeErr) {
      console.error('Aviso: Falha ao criar pagamento inicial:', chargeErr.message);
    }

    res.status(201).json(aluno);
  } catch (e) {
    console.error('Erro ao criar aluno:', e);
    res.status(500).json({ error: e.message || 'Erro interno' });
  }
};

export const update = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  const existing = db.prepare('SELECT * FROM alunos WHERE id = ? AND user_id = ?').get(id, userId);
  if (!existing) return res.status(404).json({ error: 'Aluno não encontrado' });
  
  const { nome, email, telefone, valor, plano, status, vencimento } = req.body;
  
  db.prepare(`
    UPDATE alunos 
    SET nome = ?, email = ?, telefone = ?, valor = ?, plano = ?, vencimento = ?, status = ? 
    WHERE id = ? AND user_id = ?
  `).run(
      nome ?? existing.nome,
      email ?? existing.email,
      telefone ?? existing.telefone,
      valor ?? existing.valor,
      (plano ?? existing.plano),
      (vencimento ?? existing.vencimento),
      status ?? existing.status,
      id,
      userId
    );
    
  const row = db.prepare('SELECT * FROM alunos WHERE id = ?').get(id);
  res.json(row);
};

export const remove = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  const info = db.prepare('DELETE FROM alunos WHERE id = ? AND user_id = ?').run(id, userId);
  if (info.changes === 0) return res.status(404).json({ error: 'Aluno não encontrado' });
  res.status(204).send();
};