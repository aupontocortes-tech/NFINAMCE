# PRD - NFINANCE

## Visão Geral
Aplicativo web responsivo (mobile first) para gerenciamento e cobrança automática de alunos de personal trainer. O sistema permite organizar alunos, datas de vencimento e envia lembretes automáticos de pagamento via WhatsApp (simulado).

## Objetivos
- **Principal**: Automatizar a cobrança de mensalidades para personal trainers.
- **Secundários**: 
  - Organizar a base de alunos e status de pagamento.
  - Oferecer uma visão clara do fluxo de caixa mensal (Dashboard).
  - Reduzir a inadimplência através de lembretes automáticos.

## Público-Alvo
Personal Trainers que gerenciam seus alunos de forma autônoma.

## Funcionalidades Core
1. **Login Simples**: Acesso seguro ao sistema.
2. **Dashboard**: Visão geral de alunos, valores a receber e pendências.
3. **Gestão de Alunos**: Cadastrar, editar, excluir e listar alunos com status de pagamento.
4. **Automação de Cobrança**: Verificação diária de vencimentos e envio de mensagens.
5. **Integração WhatsApp (Simulada)**: Geração de mensagens de cobrança personalizadas.

## Requisitos Técnicos
- **Framework**: Next.js 15.x com App Router (React + Node.js environment)
- **UI**: Shadcn/ui + Tailwind CSS (Design System Zinc/Clean)
- **Linguagem**: TypeScript
- **Banco de Dados**: Em memória (Mock Data / JSON array)
- **Autenticação**: Simples (Email/Senha hardcoded ou mock)

## Requisitos de Segurança (OWASP Top 10)
1. **Broken Access Control**: Acesso restrito às rotas administrativas.
2. **Cryptographic Failures**: Uso de HTTPS (em produção).
3. **Injection**: Sanitização de inputs nos formulários.
4. **Insecure Design**: Princípio do menor privilégio.
5. **Security Misconfiguration**: Headers de segurança padrão do Next.js.

## Métricas de Sucesso
- Facilidade de uso em dispositivos móveis (Mobile First).
- Corretude na identificação de cobranças pendentes.
- Visual clean e profissional.
