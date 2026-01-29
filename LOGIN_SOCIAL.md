# 🔐 Login com Gmail, Facebook e Twitter

A tela de login do NFinance permite entrar com **Gmail (Google)**, **Facebook** ou **Twitter (X)** além do login por e-mail e senha.

## O que foi implementado

- **Frontend:** Botões "Gmail", "Facebook" e "Twitter" na página `/login`. Ao clicar, o usuário é redirecionado para o provedor e, após autorizar, volta para o app e entra direto no dashboard.
- **Backend:** Endpoint `POST /auth/social` que cria ou busca o usuário pelo e-mail e devolve o mesmo token JWT usado no restante do app.

## Configuração (obrigatória para os botões funcionarem)

1. **AUTH_SECRET** (obrigatório para NextAuth)
   - Gere um valor: `npx auth secret`
   - Coloque em `.env.local` na raiz do projeto: `AUTH_SECRET=...`

2. **Google (Gmail)**
   - Crie um projeto em [Google Cloud Console](https://console.cloud.google.com/apis/credentials) e ative "Google+ API" ou "People API".
   - Crie credenciais OAuth 2.0 (tipo "Aplicativo da Web").
   - Em "URIs de redirecionamento autorizados" adicione: `http://localhost:3000/api/auth/callback/google` (e em produção a URL do seu domínio).
   - Em `.env.local`: `AUTH_GOOGLE_ID=...` e `AUTH_GOOGLE_SECRET=...`

3. **Facebook**
   - Crie um app em [Facebook for Developers](https://developers.facebook.com/apps).
   - Adicione o produto "Facebook Login" e configure "Login do Facebook para a Web".
   - Em "URIs de redirecionamento OAuth válidos" adicione: `http://localhost:3000/api/auth/callback/facebook`.
   - Em `.env.local`: `AUTH_FACEBOOK_ID=...` e `AUTH_FACEBOOK_SECRET=...`

4. **Twitter (X)**
   - Crie um projeto em [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard).
   - Crie um app e em "User authentication settings" ative OAuth 2.0.
   - Callback URL: `http://localhost:3000/api/auth/callback/twitter`.
   - Em `.env.local`: `AUTH_TWITTER_ID=...` (Client ID) e `AUTH_TWITTER_SECRET=...` (Client Secret).

Se um provedor não estiver configurado (sem ID/Secret no `.env.local`), o botão correspondente não estará ativo no servidor; o login por e-mail e senha continua funcionando.

## Fluxo

1. Usuário clica em "Gmail", "Facebook" ou "Twitter".
2. Redirecionamento para o provedor → usuário autoriza.
3. Provedor redireciona para `/auth/callback`.
4. A página de callback chama `POST /auth/social` com e-mail e nome do usuário.
5. O backend cria o usuário (se não existir) e devolve o JWT.
6. O frontend guarda o token e redireciona para `/dashboard`.

---

**Resumo:** Login social (Gmail, Facebook, Twitter) está integrado. Para os botões funcionarem, configure `AUTH_SECRET` e as credenciais dos provedores desejados em `.env.local` (copie de `.env.local.example`).
