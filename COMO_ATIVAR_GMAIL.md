# Ativar login com Gmail (passo a passo rápido)

Enquanto **AUTH_GOOGLE_ID** e **AUTH_GOOGLE_SECRET** estiverem vazios no `.env.local`, a mensagem do canto inferior direito vai continuar aparecendo e o botão Gmail não vai logar de verdade. Siga os passos abaixo para ativar.

---

## 1. Criar projeto no Google

1. Abra: **image.png**
2. Faça login com sua conta Google.
3. No topo, clique no **seletor de projeto** (onde está escrito o nome do projeto).
4. Clique em **Novo projeto**.
5. Nome: por exemplo **NFinance**.
6. Clique em **Criar** e espere. Depois selecione esse projeto no seletor.

---

## 2. Ativar a tela de consentimento OAuth

1. No menu lateral, vá em **APIs e serviços** → **Tela de consentimento OAuth** (ou **OAuth consent screen**).
2. Tipo de usuário: escolha **Externo** e clique em **Criar**.
3. Preencha:
   - Nome do app: **NFinance**
   - E-mail de suporte: seu e-mail
   - E-mail do desenvolvedor: seu e-mail
4. Clique em **Salvar e continuar** até o fim (pode pular “Escopos” e “Usuários de teste” se quiser).
5. Volte para **APIs e serviços** → **Credenciais**.

---

## 3. Criar credenciais OAuth (Client ID e Secret)

1. Clique em **+ Criar credenciais** → **ID do cliente OAuth**.
2. Tipo de aplicativo: **Aplicativo da Web**.
3. Nome: **NFinance Web** (ou qualquer nome).
4. Em **URIs de redirecionamento autorizados**, clique em **+ Adicionar URI** e adicione exatamente:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
5. Clique em **Criar**.
6. Na janela que abrir, você verá:
   - **ID do cliente** (uma string longa) → é o **AUTH_GOOGLE_ID**
   - **Segredo do cliente** → clique em **Mostrar** e copie → é o **AUTH_GOOGLE_SECRET**
7. Deixe essa janela aberta ou copie os dois valores para um bloco de notas.

---

## 4. Colar no seu projeto

1. Na pasta do projeto NFinance, abra o arquivo **`.env.local`** (na raiz, onde está o `package.json` do Next.js).
2. Encontre as linhas:
   ```
   AUTH_GOOGLE_ID=
   AUTH_GOOGLE_SECRET=
   ```
3. Cole o **ID do cliente** depois do `=` em **AUTH_GOOGLE_ID** (sem espaços).
4. Cole o **Segredo do cliente** depois do `=` em **AUTH_GOOGLE_SECRET** (sem espaços).
5. Salve o arquivo (Ctrl+S).

Exemplo (com valores fictícios):
```
AUTH_GOOGLE_ID=123456789-xxxx.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=GOCSPX-xxxxxxxxxxxxxxxx
```

---

## 5. Reiniciar o frontend

1. Feche a janela do terminal onde está rodando **npm run dev** (ou o frontend).
2. Na pasta raiz do projeto, rode de novo: **npm run dev**.
3. Abra **http://localhost:3000/login** e clique em **Gmail**.

Agora o Gmail deve abrir a tela do Google para você autorizar e, depois, entrar direto no aplicativo. A mensagem do canto inferior direito não deve mais aparecer ao clicar em Gmail.

---

## Resumo

| Onde pegar | O que colar no `.env.local` |
|------------|-----------------------------|
| Google Cloud Console → Credenciais → ID do cliente | **AUTH_GOOGLE_ID** |
| Google Cloud Console → Credenciais → Segredo do cliente | **AUTH_GOOGLE_SECRET** |

Para **Facebook** e **Twitter**, o processo é parecido em developers.facebook.com e developer.twitter.com; use o arquivo **LOGIN_SOCIAL.md** para os detalhes.
