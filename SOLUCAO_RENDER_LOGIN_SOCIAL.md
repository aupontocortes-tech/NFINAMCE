# Login com Gmail/Facebook/Twitter na Render — Solução rápida

Se o login com Gmail, Facebook ou Twitter **não está indo** no site na Render, siga esta lista na ordem.

---

## 1. Backend na Render

1. Acesse **https://dashboard.render.com** e abra o serviço do **backend**.
2. Anote a **URL do serviço** (ex.: `https://nfinamce.onrender.com` ou `https://nfinance-api.onrender.com`). Você vai usar no passo 3.
3. Confira se o status está **Live** (verde). Se não estiver, clique em **Manual Deploy** e espere terminar.
4. No backend, em **Environment**, confira:
   - **DATABASE_URL** — obrigatório em produção (PostgreSQL da Render ou outro).
   - **JWT_SECRET** — recomendado (senha longa e aleatória).

---

## 2. Frontend na Render (nfinance-site)

1. No dashboard da Render, abra o serviço do **frontend** (ex.: **nfinance-site**).
2. Vá em **Environment** e confira **todas** estas variáveis (valores corretos):

   | KEY | Valor (exemplo) |
   |-----|----------------|
   | **NEXT_PUBLIC_API_URL** | **URL do backend** que você anotou (ex.: `https://nfinamce.onrender.com`) — **sem barra no final** |
   | AUTH_GOOGLE_ID | ID do cliente OAuth do Google |
   | AUTH_GOOGLE_SECRET | Chave secreta do Google |
   | AUTH_SECRET | Senha longa (ex.: gere em https://generate-secret.vercel.app/32) |
   | AUTH_URL | `https://nfinance-site.onrender.com` |
   | NEXTAUTH_URL | `https://nfinance-site.onrender.com` |

3. **Importante:** **NEXT_PUBLIC_API_URL** tem que ser **exatamente** a URL do seu backend (a que aparece no serviço do backend na Render). Se o backend for `https://meu-backend.onrender.com`, use essa URL.
4. Clique em **Save Changes** e faça **Manual Deploy** do frontend.

---

## 3. Google Cloud (só para Gmail)

1. Acesse **https://console.cloud.google.com/apis/credentials**.
2. Edite o cliente OAuth **"Cliente Web 1"** (ou o que você usa).
3. Em **URIs de redirecionamento autorizados** confira se existe:
   - `https://nfinance-site.onrender.com/api/auth/callback/google`
4. Salve.

---

## 4. Facebook / Twitter (se usar)

- **Facebook:** Em developers.facebook.com, no app, em "Facebook Login" → "Configurações", adicione **URI de redirecionamento**:
  `https://nfinance-site.onrender.com/api/auth/callback/facebook`
- **Twitter:** No portal do desenvolvedor Twitter, em "Callback URLs", adicione:
  `https://nfinance-site.onrender.com/api/auth/callback/twitter`

---

## 5. Testar de novo

1. Espere 1–2 minutos após o deploy (o backend pode estar “acordando”).
2. Abra **https://nfinance-site.onrender.com** em uma aba anônima (para evitar cache).
3. Clique em **Entrar com Gmail** (ou Facebook/Twitter) e conclua o fluxo.
4. Se ainda der erro: tente **e-mail e senha**. Se e-mail/senha funcionar, o backend está ok e o problema é OAuth (URL de callback ou variáveis do frontend).

---

## Resumo rápido

- **Backend:** Live, com DATABASE_URL e JWT_SECRET.
- **Frontend:** NEXT_PUBLIC_API_URL = URL do backend (sem barra); AUTH_* e NEXTAUTH_URL corretos; deploy após salvar.
- **Google:** URI de redirecionamento com `/api/auth/callback/google`.
- Depois: aguardar 1–2 min e testar de novo.
