# Front-end na Vercel (rodando junto com o da Render)

O mesmo front-end pode estar na **Vercel** e na **Render**. Os dois usam o mesmo backend na Render.

## Depois do push: configurar na Vercel (uma vez)

1. Acesse **[vercel.com](https://vercel.com)** e faça login (use a mesma conta GitHub do repositório).
2. Clique em **"Add New..."** → **"Project"**.
3. Importe o repositório **NFINAMCE** (ou o seu fork).
4. **Configuração do projeto:**
   - **Root Directory:** deixe em branco (o front é a raiz do repo).
   - **Framework Preset:** Next.js (a Vercel detecta sozinho).
5. **Environment Variables** (antes de dar Deploy):
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://nfinamce.onrender.com` (ou a URL do seu backend na Render)
   - Marque **Production** (e Preview se quiser).
6. Clique em **"Deploy"**.

Pronto. A partir daí, cada push na branch conectada gera deploy automático na Vercel.

## Resumo

| Onde    | URL exemplo                    | Quando atualiza      |
|---------|--------------------------------|----------------------|
| Vercel  | `nfinance.vercel.app`          | A cada push na branch |
| Render  | `nfinance-frontend.onrender.com` | A cada push (ou Manual Deploy) |
| Backend | `nfinamce.onrender.com`       | Um só, usado pelos dois front-ends |

Os dois front-ends usam o mesmo código e a mesma API.
