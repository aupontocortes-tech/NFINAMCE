# 🚀 Guia Completo: Tudo na Render (Backend + Frontend)

## 🎯 Objetivo

Deixar **TUDO** rodando na Render:
- ✅ Backend (API + Banco de Dados + Resend)
- ✅ Frontend (Site Next.js)
- ✅ Tudo funcionando e conectado

---

## 📋 Parte 1: Corrigir o Backend "NFINAMCE"

### Passo 1: Verificar Configuração

1. Acesse o serviço **NFINAMCE** na Render
2. Vá em **Settings**

#### Build & Deploy:
- **Root Directory:** `server` ✅
- **Build Command:** `npm install` ✅
- **Start Command:** `npm start` ✅

#### Environment (Variáveis):
Adicione/Verifique:

```
NODE_ENV=production
JWT_SECRET=sua-senha-super-secreta-aqui-2026
RESEND_API_KEY=re_sua_chave_resend (opcional)
```

**Para Banco de Dados:**

**Opção A - SQLite (Simples, mas limitado):**
- Não configure `DATABASE_URL`
- O código usa SQLite automaticamente

**Opção B - PostgreSQL (Recomendado):**
1. Na Render: **New +** → **PostgreSQL**
2. Crie o banco
3. Copie a **Internal Database URL**
4. Adicione no serviço NFINAMCE:
   ```
   DATABASE_URL=postgresql://user:pass@host:port/dbname
   ```

### Passo 2: Ver Logs

1. Clique em **"Logs"** no serviço NFINAMCE
2. Veja qual é o erro específico
3. Se necessário, veja `CORRIGIR_RENDER.md` para soluções

### Passo 3: Redeploy

1. Clique nos **3 pontinhos** (⋮) do último deploy
2. Selecione **"Redeploy"**
3. Aguarde (2-5 minutos)

### Passo 4: Testar

Quando status ficar **"Deployed"** (verde):

Teste a URL:
```
https://nfinamce.onrender.com/health
```

Deve retornar: `OK`

**Anote essa URL!** Você vai precisar para o frontend.

---

## 📋 Parte 2: Criar/Corrigir Frontend na Render

### Passo 1: Criar Novo Serviço

1. Na Render: **New +** → **Web Service**
2. Conecte o repositório: `aupontocortes-tech/NFINAMCE`

### Passo 2: Configurar Frontend

Preencha:

| Campo | Valor |
|-------|-------|
| **Name** | `nfinance-frontend` |
| **Region** | Escolha a mais próxima |
| **Branch** | `main` |
| **Root Directory** | `.` (ponto ou vazio) ⚠️ **IMPORTANTE** |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | `Free` (ou pago) |

### Passo 3: Variáveis de Ambiente

Antes de criar, clique em **"Advanced"** e adicione:

**OBRIGATÓRIA:**
```
NEXT_PUBLIC_API_URL=https://nfinamce.onrender.com
```
(Use a URL real do seu backend!)

**OPCIONAL:**
```
NODE_ENV=production
```

### Passo 4: Criar e Aguardar

1. Clique em **"Create Web Service"**
2. Aguarde o build (5-10 minutos na primeira vez)

### Passo 5: Testar

Quando status ficar **"Deployed"** (verde):

1. Acesse a URL do frontend (ex: `https://nfinance-frontend.onrender.com`)
2. Teste login/registro
3. Verifique se carrega dados do backend

---

## ✅ Estrutura Final na Render

Você terá **2 serviços**:

1. **NFINAMCE** (Backend)
   - URL: `https://nfinamce.onrender.com`
   - Root: `server`
   - Variáveis: `JWT_SECRET`, `RESEND_API_KEY`, `DATABASE_URL`

2. **nfinance-frontend** (Frontend)
   - URL: `https://nfinance-frontend.onrender.com`
   - Root: `.`
   - Variável: `NEXT_PUBLIC_API_URL` = URL do backend

---

## 🔧 Configurações Importantes

### Backend (NFINAMCE):

**Variáveis Obrigatórias:**
- `NODE_ENV=production`
- `JWT_SECRET` (senha forte)

**Variáveis Opcionais:**
- `RESEND_API_KEY` (para emails)
- `DATABASE_URL` (se usar PostgreSQL)

### Frontend (nfinance-frontend):

**Variável Obrigatória:**
- `NEXT_PUBLIC_API_URL` = URL do backend

---

## 🐛 Troubleshooting

### Backend não inicia:

1. Verifique logs na Render
2. Confirme que `Root Directory` está como `server`
3. Verifique se todas as variáveis estão configuradas
4. Veja `CORRIGIR_RENDER.md` para mais detalhes

### Frontend não conecta ao backend:

1. Verifique se `NEXT_PUBLIC_API_URL` está correta
2. Confirme que o backend está online (teste `/health`)
3. Verifique CORS (já está configurado no código)

### Emails não enviam:

1. Configure `RESEND_API_KEY` no backend
2. Obtenha a chave em: https://resend.com/api-keys
3. Veja `CONFIGURAR_RESEND.md` para mais detalhes

---

## 🎯 Checklist Final

- [ ] Backend "NFINAMCE" com status **"Deployed"** (verde)
- [ ] Backend responde em `/health`
- [ ] Frontend criado na Render
- [ ] Frontend com `NEXT_PUBLIC_API_URL` configurada
- [ ] Frontend com status **"Deployed"** (verde)
- [ ] Login/Registro funcionando
- [ ] Dados carregando do backend
- [ ] Resend configurado (opcional)

---

## 🚀 Depois de Configurar

Toda vez que você fizer:
```bash
git push origin main
```

A Render atualiza **automaticamente** ambos os serviços!

**Não precisa fazer nada manual!** 🎉

---

## 📚 Documentação Relacionada

- `CORRIGIR_RENDER.md` - Como corrigir o backend que está falhando
- `CONFIGURAR_RESEND.md` - Como configurar emails
- `GUIA_RENDER_COMPLETO.md` - Guia detalhado de deploy

---

**Pronto! Agora você tem tudo na Render funcionando!** 🚀
