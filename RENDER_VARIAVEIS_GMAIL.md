# Variáveis de ambiente no Render (nfinance-site) — Login com Gmail

Use esta tabela no painel do Render → nfinance-site → **Environment** → **+ Add**.

---

## Variáveis para adicionar

| # | KEY | VALUE (o que colar) |
|---|-----|----------------------|
| 1 | `AUTH_GOOGLE_ID` | O **ID do cliente OAuth** do Google. Exemplo: `766173592030-xxxxxxxxxx.apps.googleusercontent.com`. Você pega em: Google Cloud Console → APIs e serviços → Credenciais → Cliente Web 1 → **ID do cliente** (copie o valor inteiro). |
| 2 | `AUTH_GOOGLE_SECRET` | A **chave secreta** do mesmo cliente. No Google Cloud, na mesma tela do "Cliente Web 1", em **Chave secreta do cliente**: clique para revelar e copie o valor inteiro. |
| 3 | `AUTH_SECRET` | Uma senha longa e aleatória (mín. 32 caracteres). Pode gerar em: **https://generate-secret.vercel.app/32** — copie o resultado e cole no VALUE. |
| 4 | `AUTH_URL` | `https://nfinance-site.onrender.com` (sem barra no final). |
| 5 | `NEXTAUTH_URL` | `https://nfinance-site.onrender.com` (igual ao anterior). |

---

## Importante

- **Não apague** a variável **NEXT_PUBLIC_API_URL** que já está lá.
- Ela deve continuar com o valor: **https://nfinamce.onrender.com**

---

## Resumo rápido (só os valores para colar)

- **AUTH_GOOGLE_ID** → cole o ID do cliente OAuth do Google (termina em `.apps.googleusercontent.com`)
- **AUTH_GOOGLE_SECRET** → cole a chave secreta do cliente (Google Cloud, mesma tela)
- **AUTH_SECRET** → gere em https://generate-secret.vercel.app/32 e cole
- **AUTH_URL** → `https://nfinance-site.onrender.com`
- **NEXTAUTH_URL** → `https://nfinance-site.onrender.com`

Depois: **Save Changes** e **Manual Deploy** do nfinance-site.
