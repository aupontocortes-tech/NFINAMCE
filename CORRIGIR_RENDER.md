# 🔧 Como Corrigir o Serviço "NFINAMCE" na Render

## ❌ Problema Atual

O serviço **NFINAMCE** está com status **"Failed service"** na Render.

## 🔍 Causas Comuns

1. **Porta incorreta** - Render usa porta dinâmica via `process.env.PORT`
2. **Banco de dados não configurado** - Precisa de `DATABASE_URL` ou usar SQLite
3. **Variáveis de ambiente faltando** - `JWT_SECRET` obrigatório
4. **Build falhando** - Dependências não instaladas

---

## ✅ Solução Passo a Passo

### 1. Verificar Configuração do Serviço

Na Render, clique no serviço **NFINAMCE** e verifique:

#### **Settings → Build & Deploy:**

- **Root Directory:** `server` ✅
- **Build Command:** `npm install` ✅
- **Start Command:** `npm start` ✅
- **Environment:** `Node` ✅

#### **Settings → Environment:**

Verifique se tem estas variáveis:

**OBRIGATÓRIAS:**
```
NODE_ENV=production
JWT_SECRET=sua-senha-secreta-forte-aqui
```

**OPCIONAIS (mas recomendadas):**
```
RESEND_API_KEY=re_sua_chave_resend
DATABASE_URL=postgresql://... (se usar PostgreSQL)
```

**Se não tiver PostgreSQL:**
- Deixe `DATABASE_URL` vazio ou não configure
- O código vai usar SQLite automaticamente

---

### 2. Verificar Logs

1. Clique em **"Logs"** no serviço NFINAMCE
2. Veja a última mensagem de erro
3. Procure por:
   - `❌ ERRO CRÍTICO`
   - `Schema initialization error`
   - `Cannot connect to database`
   - `Port already in use`

---

### 3. Correções Específicas

#### Se o erro for de PORT:

O código já foi corrigido para usar `process.env.PORT` automaticamente.

**Ação:** Faça **Redeploy** do serviço.

#### Se o erro for de Banco de Dados:

**Opção A - Usar SQLite (Mais Simples):**
- Não configure `DATABASE_URL`
- O código usa SQLite automaticamente
- ⚠️ SQLite na Render pode ter limitações

**Opção B - Usar PostgreSQL (Recomendado):**
1. Na Render, vá em **"New +"** → **"PostgreSQL"**
2. Crie o banco
3. Copie a **Internal Database URL**
4. No serviço NFINAMCE, adicione:
   ```
   DATABASE_URL=postgresql://user:pass@host:port/dbname
   ```
5. Faça **Redeploy**

#### Se o erro for de JWT_SECRET:

1. Gere uma senha forte (ex: use gerador online)
2. No serviço NFINAMCE → **Environment**
3. Adicione:
   ```
   JWT_SECRET=sua-senha-super-secreta-aqui-2026
   ```
4. Faça **Redeploy**

---

### 4. Fazer Redeploy

1. No serviço NFINAMCE
2. Clique nos **3 pontinhos** (⋮) no último deploy
3. Selecione **"Redeploy"**
4. Aguarde o build (2-5 minutos)

---

### 5. Verificar se Funcionou

Após o redeploy, teste:

1. **Health Check:**
   ```
   https://seu-servico.onrender.com/health
   ```
   Deve retornar: `OK`

2. **Root:**
   ```
   https://seu-servico.onrender.com/
   ```
   Deve retornar: `NFinance Backend V2.1.0...`

---

## 📋 Checklist de Configuração

Antes de fazer redeploy, confirme:

- [ ] **Root Directory:** `server`
- [ ] **Build Command:** `npm install`
- [ ] **Start Command:** `npm start`
- [ ] **NODE_ENV:** `production`
- [ ] **JWT_SECRET:** Configurado (senha forte)
- [ ] **RESEND_API_KEY:** Configurado (opcional)
- [ ] **DATABASE_URL:** Configurado OU deixado vazio (SQLite)

---

## 🐛 Erros Comuns e Soluções

### Erro: "Cannot find module"
**Solução:** Verifique se `Root Directory` está como `server`

### Erro: "Port already in use"
**Solução:** Código já corrigido, faça redeploy

### Erro: "Database connection failed"
**Solução:** Configure `DATABASE_URL` ou deixe vazio para SQLite

### Erro: "JWT_SECRET is required"
**Solução:** Adicione `JWT_SECRET` nas variáveis de ambiente

---

## ✅ Após Corrigir

Quando o serviço estiver **"Deployed"** (verde):

1. Anote a URL do backend (ex: `https://nfinance-backend.onrender.com`)
2. Use essa URL no frontend:
   - Variável: `NEXT_PUBLIC_API_URL`
   - Valor: `https://nfinance-backend.onrender.com`

---

## 🚀 Próximos Passos

Depois que o backend estiver funcionando:

1. Configure o **Frontend na Render** (veja `GUIA_RENDER_COMPLETO.md`)
2. Configure `NEXT_PUBLIC_API_URL` apontando para o backend
3. Teste login e registro
4. Verifique se emails estão sendo enviados (se configurou Resend)

---

**Se ainda der erro, me envie os logs do serviço que eu ajudo a diagnosticar!** 🔍
