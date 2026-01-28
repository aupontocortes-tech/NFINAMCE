# 💪 NFinance - Sistema de Gestão para Personal Trainers

Sistema completo para gerenciar alunos, aulas, pagamentos e cobranças automatizadas.

## 🚀 Início Rápido

### Windows (PowerShell):
```powershell
.\INICIAR-AGORA.ps1
```

### Ou manualmente:
```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend  
npm run dev
```

**Acesse:** http://localhost:3000

---

## 📋 Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

---

## ⚙️ Configuração

### 1. Variáveis de Ambiente

O arquivo `server/.env` já está criado com valores padrão.

**Para usar emails (Resend):**
1. Obtenha sua chave em: https://resend.com/api-keys
2. Edite `server/.env`:
   ```
   RESEND_API_KEY=re_sua_chave_aqui
   ```

**Guia completo:** Veja `CONFIGURAR_RESEND.md`

### 2. Banco de Dados

- **Localhost:** SQLite automático (não precisa configurar)
- **Render:** Configure `DATABASE_URL` com PostgreSQL

---

## 🌐 Deploy na Render

### Backend:
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`

### Frontend:
- Root Directory: `.`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Variável: `NEXT_PUBLIC_API_URL` = URL do backend

**Guia completo:** Veja `GUIA_RENDER_COMPLETO.md`

---

## 📚 Documentação

- `SETUP_COMPLETO.md` - Guia completo de setup
- `CONFIGURAR_RESEND.md` - Como configurar emails
- `GUIA_RENDER_COMPLETO.md` - Deploy na Render
- `COMO_FAZER_LOGIN.md` - Guia de autenticação
- `COMO_INICIAR.md` - Como iniciar localmente

---

## 🎯 Funcionalidades

- ✅ Autenticação (Login/Registro)
- ✅ Gestão de Alunos
- ✅ Gestão de Aulas
- ✅ Controle de Pagamentos
- ✅ Dashboard Financeiro
- ✅ Envio de Emails (Resend)
- ✅ Cobranças Automatizadas

---

## 🛠️ Tecnologias

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, Knex.js
- **Banco:** SQLite (dev) / PostgreSQL (prod)
- **Email:** Resend API
- **Autenticação:** JWT

---

## 📝 Estrutura do Projeto

```
NFINAMCE/
├── server/          # Backend (Express)
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   └── data/
│   └── .env         # Variáveis de ambiente
├── src/             # Frontend (Next.js)
│   ├── app/
│   ├── components/
│   └── lib/
└── package.json     # Frontend dependencies
```

---

## ✅ Status

- ✅ Backend funcionando
- ✅ Frontend funcionando
- ✅ Banco de dados configurado
- ✅ Resend configurado (precisa adicionar API Key)
- ✅ Código no GitHub
- ✅ Pronto para deploy na Render

---

## 🐛 Problemas?

Veja `SETUP_COMPLETO.md` para troubleshooting completo.

---

**Desenvolvido com 💪 para Personal Trainers**
