# Configurar o restante (banco nfinance já criado)

O banco **nfinance** está **Available**. Siga só estes passos.

---

## Passo 1: Copiar a URL do banco (2 min)

1. Na página do banco **nfinance** (onde você está), clique no botão **"Connect"** (canto superior direito).
2. No menu que abrir, procure **"Internal Database URL"** (ou "Connection string" / "Database URL").
3. Clique no ícone de **copiar** ao lado dessa URL (começa com `postgres://` ou `postgresql://`).
4. Cole em um bloco de notas e deixe guardada — você vai colar no próximo passo.

---

## Passo 2: Colar no backend NFINAMCE (2 min)

1. Na Render, na **lista de serviços** (Overview), clique no serviço **NFINAMCE** (é o backend).
2. No menu da **esquerda**, clique em **Environment**.
3. Clique em **Edit** (ou **+ Add**).
4. **Adicione a primeira variável:**
   - **KEY:** `DATABASE_URL`
   - **VALUE:** cole a URL que você copiou no Passo 1 (Ctrl+V).
5. **Adicione a segunda variável:**
   - **KEY:** `JWT_SECRET`
   - **VALUE:** abra **https://generate-secret.vercel.app/32** em outra aba, copie o texto que aparecer e cole aqui.
6. Clique em **Save Changes** (ou **Save**).
7. Na página do NFINAMCE, clique em **Manual Deploy** → **Deploy latest commit**.
8. Espere o status ficar **Live** (verde).

---

## Passo 3: Conferir o frontend (1 min)

1. Na lista de serviços, clique em **nfinance-site** (frontend).
2. Vá em **Environment**.
3. Confira se existe **NEXT_PUBLIC_API_URL** e se o valor é a **URL do backend** (do serviço NFINAMCE).  
   Exemplo: `https://nfinamce.onrender.com` (sem barra no final).  
   Se o nome do seu backend for outro, use a URL que aparece no topo da página do NFINAMCE.
4. Se alterou algo: **Save Changes** e **Manual Deploy** do nfinance-site.

---

## Passo 4: Testar

1. Espere **1–2 minutos**.
2. Abra **https://nfinance-site.onrender.com** (pode ser em aba anônima).
3. Clique em **Entrar com Gmail** (ou use e-mail e senha) e faça o login.

Pronto. O restante (tabelas, login social) o próprio backend configura ao subir com a **DATABASE_URL** certa.
