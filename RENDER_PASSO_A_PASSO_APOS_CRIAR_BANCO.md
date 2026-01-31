# Render — Passo a passo depois de criar o banco "nfinance"

O banco **nfinance** está sendo criado. Quando o status mudar para **Available** (verde), siga esta ordem.

---

## Parte 1: Pegar a URL do banco (nfinance)

1. Na Render (**dashboard.render.com**), na lista de serviços, clique no banco **nfinance**.
2. Na página do banco, procure a seção **"Connect"** ou **"Connection"** (ou **"Info"**).
3. Copie a **Internal Database URL** (ou a URL que a Render mostrar para conexão).  
   Ela começa com `postgres://` ou `postgresql://`.  
   **Guarde essa URL** — você vai colar no backend no próximo passo.

---

## Parte 2: Configurar o backend (NFINAMCE)

1. Na Render, na lista de serviços, clique no serviço **NFINAMCE** (backend).
2. No menu da esquerda, clique em **Environment** (Variáveis de ambiente).
3. Clique em **Edit** (ou **+ Add**).
4. Adicione ou edite estas variáveis:

   | KEY | VALUE |
   |-----|--------|
   | **DATABASE_URL** | Cole a URL que você copiou do banco **nfinance** (a que começa com `postgres://` ou `postgresql://`). |
   | **JWT_SECRET** | Uma senha longa e aleatória. Gere em: **https://generate-secret.vercel.app/32** e cole o resultado. |

5. Clique em **Save Changes**.
6. Volte para a página principal do serviço **NFINAMCE** (Overview ou nome do serviço).
7. Clique em **Manual Deploy** → **Deploy latest commit** (ou **Deploy**).
8. Espere o deploy terminar (status **Live** / verde).

---

## Parte 3: Conferir o frontend (nfinance-site)

1. Na Render, abra o serviço **nfinance-site** (frontend).
2. Vá em **Environment**.
3. Confira se **NEXT_PUBLIC_API_URL** está com a **URL do backend** (do serviço NFINAMCE).  
   Exemplo: se o backend for `https://nfinamce.onrender.com`, use exatamente isso (sem barra no final).
4. Confira também: **AUTH_GOOGLE_ID**, **AUTH_GOOGLE_SECRET**, **AUTH_SECRET**, **AUTH_URL**, **NEXTAUTH_URL** (conforme o arquivo RENDER_VARIAVEIS_GMAIL.md).
5. Se alterou algo: **Save Changes** e **Manual Deploy** do nfinance-site.

---

## Parte 4: Testar o login

1. Espere 1–2 minutos após o deploy do backend.
2. Abra **https://nfinance-site.onrender.com** (de preferência em aba anônima).
3. Clique em **Entrar com Gmail** (ou e-mail e senha) e conclua o fluxo.

Se der erro, aguarde mais 1–2 min (backend pode estar “acordando”) e tente de novo.

---

## Resumo rápido

| O quê | Onde |
|-------|------|
| Copiar URL do banco | Serviço **nfinance** → Connect → Internal Database URL |
| Colar no backend | Serviço **NFINAMCE** → Environment → **DATABASE_URL** |
| Adicionar JWT_SECRET | Serviço **NFINAMCE** → Environment → **JWT_SECRET** |
| Salvar e fazer deploy | **NFINAMCE** → Save Changes → Manual Deploy |
| Conferir frontend | **nfinance-site** → Environment → NEXT_PUBLIC_API_URL = URL do backend |

Depois disso, o login com Gmail (e o app) deve funcionar na Render.
