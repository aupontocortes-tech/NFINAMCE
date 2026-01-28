# 🔐 Como Fazer Login - Guia Completo

## ✅ Login Atualizado!

O login agora funciona com a API real (igual ao registro). Você tem **2 opções**:

---

## 🖥️ Opção 1: Login no Localhost (Seu Computador)

### O que você precisa:
- ✅ Frontend rodando: `http://localhost:3000`
- ✅ Backend rodando: `http://localhost:3001`

### Como fazer:

1. **Inicie o Backend:**
   ```bash
   cd server
   npm start
   ```
   Aguarde ver: `🚀 Servidor rodando em http://localhost:3001`

2. **Inicie o Frontend:**
   ```bash
   npm run dev
   ```
   Aguarde ver: `Ready - started server on 0.0.0.0:3000`

3. **Acesse:** `http://localhost:3000`

4. **Faça Login ou Registro:**
   - Se já tem conta → use email e senha
   - Se não tem → clique em "Cadastre-se" e crie uma conta

### Como funciona:
- O código detecta automaticamente que está em `localhost`
- Usa a API: `http://localhost:3001`
- **Não precisa configurar nada!**

---

## ☁️ Opção 2: Login na Vercel (Nuvem)

### O que você precisa:
- ✅ Frontend na Vercel: `https://nfinamce.vercel.app`
- ✅ Backend na Render: `https://nfinamce.onrender.com` (ou sua URL)

### Como funciona:

1. **Acesse:** `https://nfinamce.vercel.app`

2. **Faça Login ou Registro:**
   - O código detecta automaticamente que NÃO está em localhost
   - Usa a API: `https://nfinamce.onrender.com` (automático)
   - **Não precisa configurar nada!**

### ⚙️ Se quiser usar outra URL de backend:

Na Vercel, adicione a variável de ambiente:
- **Nome:** `NEXT_PUBLIC_API_URL`
- **Valor:** `https://sua-url-backend.onrender.com`

---

## 🔍 Como o Código Decide Qual API Usar?

O arquivo `src/lib/utils.ts` tem a função `getApiUrl()` que decide automaticamente:

```typescript
1. Se tem variável NEXT_PUBLIC_API_URL → usa ela
2. Se está em localhost → usa http://localhost:3001
3. Se está em produção → usa https://nfinamce.onrender.com
```

**Você não precisa fazer nada!** Funciona automaticamente! 🎉

---

## ❓ Qual Usar?

| Situação | Recomendação |
|----------|--------------|
| **Testando no seu PC** | ✅ Use localhost (Opção 1) |
| **Usando no celular/outro PC** | ✅ Use Vercel (Opção 2) |
| **Desenvolvendo novas features** | ✅ Use localhost (Opção 1) |
| **Mostrando para cliente** | ✅ Use Vercel (Opção 2) |

---

## 🐛 Problemas Comuns

### Erro: "Não foi possível conectar com o servidor"

**No Localhost:**
- Verifique se o backend está rodando: `http://localhost:3001/health`
- Deve retornar: `OK`

**Na Vercel:**
- Verifique se o backend na Render está online
- Teste: `https://nfinamce.onrender.com/health`
- Deve retornar: `OK`

### Erro: "Erro ao fazer login"

- Verifique se o email e senha estão corretos
- Se não tem conta, faça registro primeiro
- Verifique se o backend está respondendo

---

## ✅ Resumo

- ✅ **Localhost:** Backend local (porta 3001) + Frontend local (porta 3000)
- ✅ **Vercel:** Backend Render + Frontend Vercel
- ✅ **Detecção automática:** O código escolhe a API certa sozinho!
- ✅ **Login e Registro:** Ambos usam a API real agora

**Pronto para usar!** 🚀
