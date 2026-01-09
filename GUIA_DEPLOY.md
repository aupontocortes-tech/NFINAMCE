# Guia de Deploy e Testes - NFINANCE

## 🚀 Status do Projeto
- **Frontend:** Hospedado na Vercel (Nuvem)
- **Backend:** Rodando Localmente (Seu Computador)

## ⚠️ IMPORTANTE: Como Testar

### ✅ Forma Correta (Recomendada)
Acesse pelo seu navegador:
**`http://localhost:3000`**

*   Funciona o login.
*   Conecta ao WhatsApp.
*   Envia mensagens.
*   **Por que?** Porque o Frontend Local (http) pode conversar livremente com o Backend Local (http).

### ❌ Link da Vercel (Ex: nfinance.vercel.app)
Se você abrir o link da Vercel enquanto o backend roda no seu PC:
*   O site carrega.
*   **O WhatsApp NÃO conecta.**
*   **Motivo:** O navegador bloqueia sites Seguros (HTTPS) de acessarem servidores Locais Inseguros (HTTP). Isso é uma trava de segurança do Chrome/Edge.

---

## 🛠️ Comandos Úteis

### Iniciar Backend (Terminal 1)
```bash
cd server
npm start
```

### Iniciar Frontend (Terminal 2)
```bash
npm run dev
```

## 📦 Estrutura de Pastas
O projeto agora é um "Monorepo" (Frontend e Backend juntos).
- `/` (Raiz) -> Código do Site (Next.js)
- `/server` -> Código do Servidor (Node.js/Express)
