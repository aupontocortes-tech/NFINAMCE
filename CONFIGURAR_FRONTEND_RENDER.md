# ⚙️ Configurar Frontend na Render - SOLUÇÃO DO LOGIN

## 🔴 Problema Atual

O frontend não consegue conectar ao backend porque a variável `NEXT_PUBLIC_API_URL` não está configurada.

---

## ✅ SOLUÇÃO RÁPIDA

### 1. Acesse o Frontend na Render

1. Vá em [render.com](https://render.com)
2. Encontre o serviço do **frontend** (provavelmente `nfinance-frontend` ou `nfinance-site`)
3. Clique nele

### 2. Configure a Variável de Ambiente

1. Vá em **Settings** → **Environment**
2. Clique em **"Add Environment Variable"**
3. Adicione:

   **Key:** `NEXT_PUBLIC_API_URL`
   
   **Value:** `https://nfinamce.onrender.com`
   
   (Use a URL real do seu backend na Render)

4. Clique em **"Save Changes"**

### 3. Faça Redeploy

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
