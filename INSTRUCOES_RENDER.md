# 🚀 Instruções Finais: Configurar Tudo na Render

## ✅ O Que Já Foi Feito Automaticamente

- ✅ Código otimizado para Render
- ✅ Porta dinâmica configurada
- ✅ Arquivos de configuração criados
- ✅ Build otimizado
- ✅ Tudo commitado no GitHub

---

## 🎯 Agora Você Precisa Fazer (5 minutos)

### Passo 1: Corrigir o Backend "NFINAMCE"

1. **Acesse:** [render.com](https://render.com) → Clique no serviço **"NFINAMCE"**

2. **Vá em Settings → Environment** e adicione/verifique:

```
NODE_ENV=production
JWT_SECRET=escolha-uma-senha-forte-aqui-2026
RESEND_API_KEY=re_sua_chave_resend (opcional por enquanto)
```

3. **Para Banco de Dados:**
   - **Opção A (Simples):** Deixe `DATABASE_URL` vazio → usa SQLite
   - **Opção B (Recomendado):** Crie PostgreSQL na Render e configure `DATABASE_URL`

4. **Faça Redeploy:**
   - Clique nos **3 pontinhos** (⋮) do último deploy
   - Selecione **"Redeploy"**
   - Aguarde 2-5 minutos

5. **Teste:**
   - Acesse: `https://nfinamce.onrender.com/health`
   - Deve retornar: `OK`
   - **Anote essa URL!**

---

### Passo 2: Criar Frontend na Render

1. **Na Render:** Clique em **"New +"** → **"Web Service"**

2. **Conecte o Repositório:**
   - Selecione: `aupontocortes-tech/NFINAMCE`
   - Clique em **"Connect"**

3. **Configure:**

| Campo | Valor |
|-------|-------|
| **Name** | `nfinance-frontend` |
| **Root Directory** | `.` (ponto ou vazio) |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | `Free` |

4. **Variáveis de Ambiente (IMPORTANTE):**
   
   Antes de criar, clique em **"Advanced"** e adicione:
   
   ```
   NEXT_PUBLIC_API_URL=https://nfinamce.onrender.com
   ```
   
   (Use a URL real do seu backend da etapa 1!)

5. **Criar:**
   - Clique em **"Create Web Service"**
   - Aguarde o build (5-10 minutos)

6. **Teste:**
   - Acesse a URL do frontend
   - Faça login/registro
   - Verifique se carrega dados

---

## ✅ Pronto!

Depois disso:

- ✅ Backend funcionando na Render
- ✅ Frontend funcionando na Render  
- ✅ Tudo conectado
- ✅ Deploy automático a cada `git push`

---

## 🐛 Se Algo Der Errado

### Backend não inicia:
- Veja os **Logs** na Render
- Confirme que `Root Directory` está como `server`
- Verifique se `JWT_SECRET` está configurado
- Veja `CORRIGIR_RENDER.md` para mais detalhes

### Frontend não conecta:
- Confirme que `NEXT_PUBLIC_API_URL` está correta
- Teste se backend está online: `/health`
- Faça **Redeploy** após alterar variáveis

---

## 📚 Arquivos de Referência

- `render.yaml` - Configuração completa (se Render suportar)
- `GUIA_RENDER_TUDO.md` - Guia detalhado
- `CORRIGIR_RENDER.md` - Soluções de problemas

---

**Siga esses passos e tudo vai funcionar!** 🚀
