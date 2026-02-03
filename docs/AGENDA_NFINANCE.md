# Agenda NFinance — Conceito e Regras (Horário Fixo)

## Contexto real

- Cada aluno possui **horário fixo semanal** (ex.: seg, qua e sex das 10h às 11h).
- **Remarcação é exceção**, não regra — só quando há imprevisto.
- Aulas têm **duração padrão de 1 hora**; o sistema calcula o horário final a partir do inicial.

---

## Objetivo

- Agenda **fácil de visualizar**.
- Deixar claro que os horários são **fixos**.
- Tratar **remarcação** como algo **temporário** e **visualmente diferente**.
- **Mínimo de cliques** para as ações do dia a dia.

---

## Regras da agenda

1. **Cadastro do aluno**
   - Definir **dias fixos da semana** (ex.: seg, qua, sex).
   - Definir **horário fixo** (ex.: 10:00 → fim 11:00 automático).

2. **Ao marcar uma aula**
   - Usuário informa só o **horário inicial** (ex.: 10:00).
   - O sistema calcula o **horário final** (ex.: 11:00).

3. **Aulas fixas**
   - Podem ser geradas automaticamente todas as semanas a partir dos alunos com `dias_fixos` e `hora_fixo_inicio` (implementação futura).
   - Ou criadas manualmente com `tipo_aula: 'fixa'` e `status: 'confirmada'`.

4. **Remarcação**
   - Ação **simples** (poucos cliques ou arrastar/soltar).
   - **Visualmente diferente** da aula fixa (cor distinta).
   - **Não altera** o horário fixo do aluno.
   - Vale só para **aquele dia/semana**; o fixo continua igual.

5. **Conflitos**
   - O sistema deve **bloquear** conflitos de horário (dois alunos no mesmo horário).

6. **Status visual**
   - **Confirmada** (aula fixa ou confirmada): cor sólida, estável (ex.: verde).
   - **Remarcada**: outra cor ou borda (ex.: amarelo/laranja).
   - **Cancelada**: visível porém discreta (ex.: vermelho suave ou riscado).

---

## Visualização

- **Semanal como padrão** — melhor para o personal ver a semana inteira e os fixos.
- **Diária como apoio** — para foco em um dia (opcional).

Motivo: o personal trabalha com dias fixos por aluno; a visão semanal deixa isso óbvio e reduz erro.

---

## Fluxos

1. **Cadastro do aluno com horário fixo**  
   Aluno → dias fixos (seg, qua, sex) + hora fixo (10:00). Opcional: gerar aulas fixas da semana.

2. **Geração automática das aulas semanais**  
   A partir de `alunos.dias_fixos` e `hora_fixo_inicio`, criar registros em `aulas` com `tipo_aula: 'fixa'`, `status: 'confirmada'`.

3. **Remarcação pontual**  
   Editar uma aula → alterar data/hora para outro slot → marcar `status: 'remarcada'` (e `tipo_aula: 'remarcada'`). O horário fixo do aluno não muda.

4. **Cancelamento sem perder histórico**  
   Atualizar aula com `status: 'cancelada'`. Não apagar; manter na agenda com visual discreto.

---

## Modelo de dados (resumo)

- **alunos**: `dias_fixos` (string, ex. "seg,qua,sex"), `hora_fixo_inicio` (string, ex. "10:00").
- **aulas**: `status` ('confirmada' | 'remarcada' | 'cancelada'), `tipo_aula` ('fixa' | 'remarcada'), `hora_inicio`, `hora_fim` (calculado +1h se omitido), `data`, `dia_semana`.

---

## Boas práticas

- Sempre exibir **nome do aluno** e **horário** no bloco da aula.
- Deixar óbvio **quem é o aluno**, **qual o horário** e **se é fixa ou remarcada**.
- Evitar telas e passos desnecessários; priorizar celular (toques rápidos).
- Legenda na agenda: Confirmada (verde), Remarcada (amarelo/laranja), Cancelada (vermelho discreto).
