# 🚀 Guia Completo: Deploy na Vercel

Seu código já está no GitHub! Agora vamos fazer o deploy na Vercel.

## ✅ Passo 1: Conectar o Repositório na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login (pode usar GitHub)
2. Clique em **"Add New..."** → **"Project"**
3. Conecte seu repositório: `aupontocortes-tech/NFINAMCE`
4. Clique em **"Import"**

## ⚙️ Passo 2: Configurar o Projeto

A Vercel detecta automaticamente que é um projeto Next.js, mas verifique:

- **Framework Preset:** Next.js
- **Root Directory:** `./` (raiz do projeto)
- **Build Command:** `npm run build` (automático)
- **Output Directory:** `.next` (automático)
- **Install Command:** `npm install` (automático)

## 🔧 Passo 3: Variáveis de Ambiente

**IMPORTANTE:** Configure estas variáveis antes do primeiro deploy:

1. Na página de configuração do projeto, vá em **"Environment Variables"**
2. Adicione:

### Para Produção (Production):
```
NEXT_PUBLIC_API_URL=https://nfinamce.onrender.com
```

**Ou se você tiver uma URL diferente do backend na Render, use essa URL.**

### Para Preview e Development (opcional):
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

> **Nota:** O código já tem fallback automático:
> - Se `NEXT_PUBLIC_API_URL` estiver definida, usa ela
> - Se não, em produção usa `https://nfinamce.onrender.com`
> - Em localhost usa `http://localhost:3001`

## 🚀 Passo 4: Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (2-5 minutos)
3. Quando terminar, você terá uma URL como: `https://nfinance.vercel.app`

## ✅ Passo 5: Verificar se Funcionou

1. Acesse a URL fornecida pela Vercel
2. Teste o login/registro
3. Verifique se o dashboard carrega

## 🔄 Atualizações Futuras

Toda vez que você fizer `git push` para o `main`, a Vercel faz deploy automático!

### Para fazer deploy manual:
1. Vá no painel do projeto na Vercel
2. Clique em **"Deployments"**
3. Clique nos 3 pontinhos do último deploy
4. Selecione **"Redeploy"**

## 🐛 Troubleshooting

### Erro: "Build Failed"
- Verifique se todas as dependências estão no `package.json`
- Veja os logs de build na Vercel para mais detalhes

### Frontend carrega mas não conecta ao backend
- Verifique se a variável `NEXT_PUBLIC_API_URL` está configurada
- Confirme se o backend na Render está online
- Teste a URL do backend diretamente: `https://nfinamce.onrender.com/health`

### Erro de CORS
- O backend já está configurado com CORS habilitado
- Se ainda der erro, verifique o arquivo `server/src/server.js`

## 📱 Domínio Personalizado (Opcional)

1. Vá em **Settings** → **Domains**
2. Adicione seu domínio (ex: `nfinance.com.br`)
3. Siga as instruções de DNS

## 🎯 Resumo Rápido

1. ✅ Código no GitHub: **FEITO**
2. ⏳ Conectar na Vercel: **Você faz agora**
3. ⏳ Configurar `NEXT_PUBLIC_API_URL`: **Você faz agora**
4. ⏳ Deploy: **Automático após configurar**

---

**Pronto!** Seu aplicativo estará no ar em poucos minutos! 🎉
