import { db } from '../data/db.js';

export const list = async (req, res) => {
  try {
    const rows = await db('funcionarios').orderBy('nome');
    res.json(rows);
  } catch (e) {
    console.error('Erro ao listar funcionários:', e);
    res.status(500).json({ error: 'Erro interno' });
  }
};

export const create = async (req, res) => {
  try {
    const { nome, telefone, valor, tipo_cobranca, status } = req.body;
    if (!nome || valor === undefined || !tipo_cobranca) {
      return res.status(400).json({ error: 'Campos obrigatórios: nome, valor, tipo_cobranca' });
    }

    const [inserted] = await db('funcionarios').insert({
      nome,
      telefone: telefone || '',
      valor: Number(valor),
      tipo_cobranca: (tipo_cobranca || 'mensal').toLowerCase(),
      status: status || 'ativo'
    }).returning('*');

    let funcionario = inserted;
    // Fallback for SQLite or if returning not supported
    if (!funcionario || typeof funcionario === 'number' || typeof funcionario === 'string') {
        if (typeof inserted === 'number' || typeof inserted === 'string') {
            funcionario = await db('funcionarios').where({ id: inserted }).first();
        } else {
             funcionario = await db('funcionarios').orderBy('id', 'desc').first();
        }
    }

    res.status(201).json(funcionario);
  } catch (e) {
    console.error('Erro ao criar funcionário:', e);
    res.status(500).json({ error: e.message || 'Erro interno' });
  }
};

export const update = async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await db('funcionarios').where({ id }).first();
    if (!existing) return res.status(404).json({ error: 'Funcionário não encontrado' });

    const { nome, telefone, valor, tipo_cobranca, status } = req.body;
    
    await db('funcionarios').where({ id }).update({
      nome: nome ?? existing.nome,
      telefone: telefone ?? existing.telefone,
      valor: valor ?? existing.valor,
      tipo_cobranca: tipo_cobranca ?? existing.tipo_cobranca,
      status: status ?? existing.status
    });

    const row = await db('funcionarios').where({ id }).first();
    res.json(row);
  } catch (e) {
    console.error('Erro ao atualizar funcionário:', e);
    res.status(500).json({ error: 'Erro interno' });
  }
};

export const remove = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await db('funcionarios').where({ id }).del();
    if (!deleted) return res.status(404).json({ error: 'Funcionário não encontrado' });
    res.status(204).send();
  } catch (e) {
    console.error('Erro ao remover funcionário:', e);
    res.status(500).json({ error: 'Erro interno' });
  }
};