export const gerarMensagem = (aluno) => {
  if (aluno.customMessage) {
    return aluno.customMessage
      .replace('{nome}', aluno.nome)
      .replace('{valor}', aluno.valor.toFixed(2));
  }

  return `Olá ${aluno.nome}, tudo bem? 😊
Passando para lembrar que a mensalidade no valor de R$ ${aluno.valor.toFixed(2)} já está disponível.
Pix: CHAVE_PIX_AQUI
Qualquer dúvida é só me avisar 💪`;
};
