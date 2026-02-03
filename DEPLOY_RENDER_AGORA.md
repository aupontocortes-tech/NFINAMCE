# Testar o NFinance na Render (passo a passo rápido)

## O que foi feito por você

Foi criado um **Blueprint** (`render.yaml`) na raiz do projeto. Com isso, a Render consegue criar os dois serviços (backend + frontend) a partir do repositório.

---

## O que você precisa fazer (uma vez)

### 1. Abrir a Render

1. Acesse **[render.com](https://render.com)** e faça login.
2. Clique em **"New +"** → **"Blueprint"**.
3. Conecte o repositório **GitHub** (se ainda não estiver conectado).
4. Selecione o repositório: **`aupontocortes-tech/NFINAMCE`** (ou o seu fork).
5. Clique em **"Connect"** / **"Apply"**.

### 2. Deixar a Render criar os serviços

- A Render vai ler o `render.yaml` e criar:
  - **nfinamce** (backend) → URL tipo `https://nfinamce.onrender.com`
  - **nfinance-frontend** (frontend) → URL tipo `https://nfinance-frontend.onrender.com`
- O primeiro deploy pode levar alguns minutos.

### 3. Configurar variáveis do backend (se precisar)

No **Dashboard da Render** → serviço **nfinamce** (backend) → **Environment**:

- **JWT_SECRET**: crie um valor secreto (ex.: gere em [randomkeygen.com](https://randomkeygen.com)).
- **DATABASE_URL**: só se você criou um Postgres na Render e quer usar em produção.

### 4. (Opcional) Apontar o frontend para o backend

O frontend já está preparado: quando acessado em `*.onrender.com`, ele usa `https://nfinamce.onrender.com` como API.

Se o nome do seu backend na Render for **diferente** de `nfinamce`:

- No serviço **nfinance-frontend** → **Environment**:
  - Adicione: **NEXT_PUBLIC_API_URL** = `https://SEU-BACKEND.onrender.com`

---

## Depois disso: como testar

1. Abra a URL do **frontend** (ex.: `https://nfinance-frontend.onrender.com`).
2. Faça login (ex.: `demo@nfinance.com` / `demo123`) ou cadastre um usuário.
3. Teste a agenda, alunos, etc.

---

## Atualizações futuras

Sempre que der **push** na branch que a Render está usando (ex.: `main`):

```bash
git add .
git commit -m "sua mensagem"
git push origin main
```

a Render fará o deploy automático do backend e do frontend (cada um conforme o `render.yaml`).

---

**Resumo:** Sim, você pode testar na Render. Conecte o repositório como **Blueprint**, deixe os dois serviços subirem, configure **JWT_SECRET** (e **DATABASE_URL** se usar Postgres) no backend e acesse a URL do frontend para testar.
