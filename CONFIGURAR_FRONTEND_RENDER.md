# ⚙️ Configurar Frontend na Render - SOLUÇÃO DO LOGIN

## 🔴 Se aparecer "Server error" ou "There is a problem with the server configuration"

Isso acontece quando o **AUTH_SECRET** não está definido no frontend (Render). Siga o passo **2** abaixo e adicione `AUTH_SECRET`. Depois faça **Redeploy**.

## 🔴 Se o site não atualizou no Render depois do push

O Render **não atualiza sozinho** a menos que o auto-deploy esteja ligado. Faça um **Manual Deploy** (passo 3) para publicar a última versão do código.

---

## 🔴 Problema: frontend não conecta ao backend

O frontend não consegue conectar ao backend porque a variável `NEXT_PUBLIC_API_URL` não está configurada (ou `AUTH_SECRET` está faltando).

---

## ✅ SOLUÇÃO RÁPIDA

### 1. Acesse o Frontend na Render

1. Vá em [render.com](https://render.com)
2. Encontre o serviço do **frontend** (provavelmente `nfinance-frontend` ou `nfinance-site`)
3. Clique nele

### 2. Configure as Variáveis de Ambiente

1. Vá em **Settings** → **Environment**
2. Clique em **"Add Environment Variable"** e adicione **todas** estas variáveis:

   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | `https://nfinamce.onrender.com` (ou a URL do seu backend na Render) |
   | `AUTH_SECRET` | Um segredo aleatório (gere com `npx auth secret` ou use uma string longa e segura) |

   **Por quê:** Sem `AUTH_SECRET`, o NextAuth mostra "Server error - There is a problem with the server configuration" ao tentar fazer login.

3. Clique em **"Save Changes"**

### 3. Faça Redeploy (obrigatório após push ou mudança de variáveis)

1. Vá em **"Manual Deploy"** → **"Deploy latest commit"** (ou **"Redeploy"** no último deploy)
2. Aguarde 2–5 minutos até o build terminar
3. **O site só atualiza no Render depois do redeploy.** Se você fez push e não viu mudanças, é porque precisa disparar o deploy manualmente (ou configurar auto-deploy pelo GitHub no serviço).

1. Vá em **"Manual Deploy"** ou clique nos **3 pontinhos** (⋮) do último deploy
2. Selecione **"Redeploy"**
3. Aguarde 2-5 minutos

---

## ✅ Verificar se Funcionou

1. Após o redeploy, acesse a URL do frontend
2. Abra o **Console do Navegador** (F12 → Console)
3. Tente fazer login
4. No console, você verá: `🔗 Tentando conectar em: https://nfinamce.onrender.com`

Se aparecer essa mensagem, está configurado corretamente!

---

## 🐛 Se Ainda Não Funcionar

### Verifique:

1. **Backend está online?**
   - Acesse: `https://nfinamce.onrender.com/health`
   - Deve retornar: `OK`

2. **URL está correta?**
   - Confirme a URL exata do backend na Render
   - Use essa URL na variável `NEXT_PUBLIC_API_URL`

3. **Variável foi salva?**
   - Verifique se aparece na lista de variáveis
   - Certifique-se de ter feito redeploy após adicionar

---

## 📋 Checklist

- [ ] Variável `NEXT_PUBLIC_API_URL` adicionada
- [ ] Valor da variável = URL do backend (ex: `https://nfinamce.onrender.com`)
- [ ] Redeploy feito após adicionar variável
- [ ] Backend está online (`/health` retorna OK)
- [ ] Testado login novamente

---

**Depois de configurar, o login deve funcionar!** 🎉
