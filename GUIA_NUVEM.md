# ☁️ Guia: Como colocar o Robô do WhatsApp na Nuvem (Render)

Para que o seu aplicativo funcione no celular sem precisar do computador ligado, precisamos hospedar o "Cérebro" (Backend) na nuvem.

O serviço recomendado é o **Render.com** (tem plano gratuito que funciona bem).

## Passo 1: Criar conta no Render
1. Acesse [render.com](https://render.com)
2. Crie uma conta (pode usar o login do GitHub).

## Passo 2: Criar o Web Service
1. No painel do Render, clique em **"New +"** e selecione **"Web Service"**.
2. Conecte com o seu GitHub e escolha o repositório `NFINAMCE`.
3. Preencha os dados:
   - **Name:** `nfinance-backend` (ou o que preferir)
   - **Region:** Escolha a mais próxima (ex: US East).
   - **Branch:** `main`
   - **Root Directory:** `server` (⚠️ MUITO IMPORTANTE: Escreva `server` aqui)
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

4. Clique em **Create Web Service**.

## Passo 3: Configurar o Frontend (Vercel)
Depois que o Render terminar de carregar, ele vai te dar uma URL (ex: `https://nfinance-backend.onrender.com`).

1. Copie essa URL.
2. Vá no painel do seu projeto na **Vercel**.
3. Vá em **Settings > Environment Variables**.
4. Adicione uma nova variável:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://nfinance-backend.onrender.com` (A URL que você copiou, sem a barra no final)
5. Salve e faça um novo Deploy na Vercel (ou Redeploy).

## Pronto! 🚀
Agora seu aplicativo vai funcionar 100% na nuvem, acessível de qualquer celular ou computador, sem depender do seu PC ligado.
