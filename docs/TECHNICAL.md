# Documentação Técnica - NFINANCE

## Arquitetura

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Estilização**: Tailwind CSS + Shadcn/ui
- **Estado Global**: Zustand (para gerenciar lista de alunos e estado da aplicação)
- **Ícones**: Lucide React

### Backend (Integrado no Next.js)
- **API Routes**: `/api/students`, `/api/cron` (para automação)
- **Dados**: Armazenamento em memória (Array de objetos) persistido durante a sessão ou Mock estático.
- **Serviços**:
  - `StudentService`: CRUD de alunos.
  - `BillingService`: Lógica de verificação de vencimentos.
  - `WhatsAppService`: Mock de envio de mensagens.

## Estrutura de Pastas
```
src/
├── app/              # Páginas (Login, Dashboard, Alunos)
├── components/       # Componentes React
│   ├── ui/           # Shadcn (Button, Card, Input...)
│   ├── layout/       # Sidebar, Header, MobileNav
│   └── features/     # AlunoCard, AlunoForm, DashboardStats
├── lib/              # Lógica de negócio e utilitários
│   ├── store/        # Zustand Store
│   ├── services/     # Lógica de cobrança e WhatsApp
│   └── types.ts      # Definições TypeScript
└── styles/           # Globais
```

## Modelo de Dados (Student)
```typescript
interface Student {
  id: string;
  name: string;
  phone: string; // Com DDD
  value: number;
  dueDate: number; // Dia do vencimento (1-31)
  customMessage?: string;
  status: 'paid' | 'pending';
  lastPaymentDate?: string;
}
```

## Automação
A função de automação será simulada e poderá ser disparada:
1. Manualmente via botão no Dashboard ("Rodar Cobrança").
2. Automaticamente ao carregar o Dashboard (verificação diária).

## Padrões de Código
- **Componentes**: Funcionais, tipados com TypeScript.
- **Estilo**: Mobile-first, classes utilitárias do Tailwind.
- **Commits**: Convencionais.
