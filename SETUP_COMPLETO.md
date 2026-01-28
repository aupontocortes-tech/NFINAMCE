# 🚀 Setup Completo - NFinance

## ✅ Status Atual

- ✅ **Backend:** Configurado e rodando em `http://localhost:3001`
- ✅ **Frontend:** Configurado e rodando em `http://localhost:3000`
- ✅ **Banco de Dados:** SQLite local (automático) / PostgreSQL na Render
- ✅ **Resend:** Configurado (precisa adicionar API Key)
- ✅ **GitHub:** Código sincronizado

---

## 🎯 Acessar o Aplicativo

### Localhost (Desenvolvimento):
**URL:** http://localhost:3000

### Render (Produção):
- **Backend:** `https://nfinamce.onrender.com` (ou sua URL)
- **Frontend:** Criar novo serviço na Render (veja `GUIA_RENDER_COMPLETO.md`)

---

## ⚙️ Configurações Necessárias

### 1. Resend API (Para Emails)

**No Localhost:**
1. Obtenha sua chave em: https://resend.com/api-keys
2. Edite `server/.env`:
   ```
   RESEND_API_KEY=re_sua_chave_aqui
   ```
3. Reinicie o backend

**Na Render:**
1. Vá em **Environment Variables**
2. Adicione: `RESEND_API_KEY` = `re_sua_chave_aqui`
3. Faça Redeploy

**Guia completo:** Veja `CONFIGURAR_RESEND.md`

---

### 2. Banco de Dados

**Localhost:**
- ✅ SQLite automático em `server/data/app.db`
- Não precisa configurar nada!

**Render:**
- Configure `DATABASE_URL` com PostgreSQL
- Ou use SQLite (não recomendado para produção)

---

### 3. Variáveis de Ambiente

**Arquivo:** `server/.env`

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=nfinance-dev-secret-key-2026
RESEND_API_KEY=re_sua_chave_aqui
```

**Na Render, adicione todas essas variáveis!**

---

## 🚀 Como Iniciar

### Método 1: Script Automático
```bash
.\iniciar-tudo.ps1
```

### Método 2: Manual
```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
npm run dev
```

---

## ✅ Verificar se Está Funcionando

1. **Backend:** http://localhost:3001/health → Deve retornar "OK"
2. **Frontend:** http://localhost:3000 → Deve mostrar tela de login
3. **Teste Login:** Crie uma conta ou faça login

---

## 📧 Testar Resend

1. Configure `RESEND_API_KEY` no `.env`
2. Faça registro de um novo usuário
3. Verifique o email de boas-vindas
4. Veja os logs do backend para confirmar envio

---

## 🔄 Deploy na Render

### Backend (Já deve estar configurado):
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`

### Frontend (Criar novo serviço):
- Root Directory: `.` (raiz)
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Variável: `NEXT_PUBLIC_API_URL` = URL do backend

**Guia completo:** Veja `GUIA_RENDER_COMPLETO.md`

---

## 🐛 Problemas Comuns

### Porta já em uso:
```powershell
# Ver processos
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Matar processo (substitua PID)
taskkill /PID <numero> /F
```

### Banco de dados não cria:
- Verifique se a pasta `server/data` existe
- Verifique permissões de escrita
- Veja logs do backend

### Resend não funciona:
- Verifique se `RESEND_API_KEY` está correta
- Veja logs do backend
- Teste a chave no site do Resend

---

## 📚 Documentação

- `CONFIGURAR_RESEND.md` - Como configurar emails
- `GUIA_RENDER_COMPLETO.md` - Deploy completo na Render
- `COMO_FAZER_LOGIN.md` - Guia de login
- `COMO_INICIAR.md` - Como iniciar localmente

---

## ✅ Checklist Final

- [x] Backend rodando localmente
- [x] Frontend rodando localmente
- [x] Banco de dados configurado
- [ ] Resend API Key configurada (você precisa fazer)
- [x] Código no GitHub
- [ ] Frontend deployado na Render (opcional)
- [ ] Variáveis de ambiente configuradas na Render

---

**Pronto para usar!** 🎉
