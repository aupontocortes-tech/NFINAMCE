import { alunos } from '../data/alunos.js';
import { verificarCobrancas, cobrarPendentesAtrasados } from '../services/cron.service.js';

export const listarAlunos = (req, res) => {
  res.json(alunos);
};

export const criarAluno = (req, res) => {
  const { nome, telefone, valor, diaVencimento, customMessage } = req.body;
  
  const novoAluno = {
    id: Date.now().toString(),
    nome,
    telefone,
    valor: Number(valor),
    diaVencimento: Number(diaVencimento),
    status: 'PENDENTE',
    ultimaCobranca: null,
    customMessage
  };
  
  alunos.push(novoAluno);
  res.status(201).json(novoAluno);
};

export const atualizarAluno = (req, res) => {
  const { id } = req.params;
  const index = alunos.findIndex(a => a.id === id);
  
  if (index === -1) return res.status(404).json({ error: 'Aluno não encontrado' });
  
  // Atualiza apenas campos enviados
  const { nome, telefone, valor, diaVencimento, customMessage, status } = req.body;
  
  if (nome) alunos[index].nome = nome;
  if (telefone) alunos[index].telefone = telefone;
  if (valor) alunos[index].valor = Number(valor);
  if (diaVencimento) alunos[index].diaVencimento = Number(diaVencimento);
  if (customMessage !== undefined) alunos[index].customMessage = customMessage;
  if (status) alunos[index].status = status;

  res.json(alunos[index]);
};

export const deletarAluno = (req, res) => {
  const { id } = req.params;
  const index = alunos.findIndex(a => a.id === id);
  
  if (index === -1) return res.status(404).json({ error: 'Aluno não encontrado' });
  
  alunos.splice(index, 1);
  res.status(204).send();
};

export const marcarComoPago = (req, res) => {
  const { id } = req.params;
  const aluno = alunos.find(a => a.id === id);
  
  if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado' });
  
  aluno.status = 'PAGO';
  res.json(aluno);
};

export const executarCobrancaManual = async (req, res) => {
  console.log('👋 Execução manual de cobrança solicitada via API.');
  await verificarCobrancas();
  res.json({ message: 'Processo de cobrança executado. Verifique os logs do servidor.' });
};

export const cobrarAtrasados = async (req, res) => {
  console.log('👋 Cobrança em massa de atrasados solicitada.');
  const resultado = await cobrarPendentesAtrasados();
  
  if (!resultado.success) {
    return res.status(400).json(resultado);
  }
  
  res.json({ message: `Processo finalizado. ${resultado.enviadas} mensagens enviadas.` });
};
