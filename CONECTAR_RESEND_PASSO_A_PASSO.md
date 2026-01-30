# 📧 Conectar o aplicativo à API Resend – Passo a passo manual

O aplicativo NFinance usa a API **Resend** (site: **resend.com**) para enviar e-mails (boas-vindas no cadastro, cobranças etc.).  
O nome do serviço é **Resend** (não “Resende”).

Siga os passos abaixo **na ordem** para tudo funcionar.

---

## Passo 1: Criar conta no Resend

1. Abra o navegador e acesse: **https://resend.com**
2. Clique em **“Sign Up”** (ou “Sign in” se já tiver conta).
3. Você pode se cadastrar com:
   - E-mail e senha, ou  
   - **GitHub** (recomendado).
4. Confirme o e-mail se o Resend pedir.

---

## Passo 2: Obter a chave da API (API Key)

1. Depois de logado no Resend, no menu lateral clique em **“API Keys”** (ou acesse: https://resend.com/api-keys).
2. Clique no botão **“Create API Key”**.
3. Dê um nome para a chave, por exemplo: **NFinance** ou **NFinance Local**.
4. Clique em **“Add”** (ou “Create”).
5. **Copie a chave** que aparece na tela.  
   - Ela começa com **`re_`** (ex.: `re_123abc...`).  
   - O Resend só mostra essa chave uma vez; se perder, terá que criar outra.
6. Guarde essa chave em um lugar seguro (bloco de notas, por exemplo) para o próximo passo.

---

## Passo 3: Colocar a chave no projeto (backend)

O aplicativo lê a chave do Resend do arquivo de configuração do **servidor** (backend).

1. Abra a pasta do projeto no computador (onde está o NFinance).
2. Entre na pasta **`server`** (backend).
3. Procure o arquivo **`.env`** dentro de `server`:
   - Se **existir** → abra com o Bloco de notas ou VS Code.
   - Se **não existir** → crie um arquivo novo chamado exatamente **`.env`** dentro da pasta `server`.
4. No arquivo `server/.env`, procure a linha **`RESEND_API_KEY`**:
   - Se já existir, **substitua** o valor pela chave que você copiou (a que começa com `re_`).
   - Se não existir, **adicione** uma linha assim (trocando pela sua chave):

   ```env
   RESEND_API_KEY=re_sua_chave_aqui
   ```

   Exemplo (com uma chave fictícia):

   ```env
   RESEND_API_KEY=re_AbCdEf123456789...
   ```

5. **Salve** o arquivo `.env` e feche.

**Importante:**  
- O arquivo deve se chamar **`.env`** (com o ponto na frente).  
- Fica dentro da pasta **`server`**, não na raiz do projeto.  
- Não compartilhe esse arquivo nem faça commit dele no Git (geralmente já está no `.gitignore`).

---

## Passo 4: Reiniciar o backend

Para o servidor carregar a nova chave:

1. Se o backend estiver rodando (janela do terminal com `npm start` no `server`), pare com **Ctrl+C**.
2. De novo na pasta **`server`**, execute:

   ```bash
   npm start
   ```

3. No terminal, procure uma destas mensagens:
   - **“📧 Serviço de E-mail: Resend inicializado com sucesso.”** → Resend está conectado.
   - **“⚠️ Serviço de E-mail: RESEND_API_KEY não encontrada. Usando fallback.”** → a chave não foi lida; confira o passo 3 (nome do arquivo, nome da variável, pasta `server`).

---

## Passo 5: Confirmar que está funcionando

### Opção A – Pelo terminal (ao iniciar o backend)

- Se aparecer **“Resend inicializado com sucesso”**, a conexão com a API Resend está ok.

### Opção B – Pela API do backend

1. Com o backend rodando, abra o navegador.
2. Acesse: **http://localhost:3001/auth/resend-status**
3. Você deve ver algo assim:
   - **Configurado:** `{"resend":true,"message":"API Resend configurada. E-mails serão enviados via Resend."}`
   - **Não configurado:** `{"resend":false,"message":"RESEND_API_KEY não definida..."}`

Se aparecer **`"resend": true`**, o aplicativo está conectado à API Resend e os e-mails serão enviados por ela (cadastro, boas-vindas etc.).

---

## Resumo rápido

| Passo | O que fazer |
|-------|-------------|
| 1 | Criar conta em **resend.com** |
| 2 | Em **API Keys**, criar uma chave e copiar (começa com `re_`) |
| 3 | No projeto, em **`server/.env`**, colocar `RESEND_API_KEY=re_sua_chave` |
| 4 | Reiniciar o backend (`npm start` dentro de `server`) |
| 5 | Ver no terminal “Resend inicializado com sucesso” ou em **http://localhost:3001/auth/resend-status** com `"resend": true` |

---

## Se estiver usando o Render (produção)

Para o site na nuvem também usar o Resend:

1. No painel do **Render**, abra o serviço do **backend** (não o frontend).
2. Vá em **Environment** (variáveis de ambiente).
3. Adicione:
   - **Key:** `RESEND_API_KEY`  
   - **Value:** a mesma chave que você usou no `server/.env` (a que começa com `re_`).
4. Salve e faça **Redeploy** do backend.

Depois disso, os e-mails em produção também serão enviados pela API Resend.

---

## Problemas comuns

- **“RESEND_API_KEY não encontrada”**  
  → A chave está em `server/.env`? O nome da variável é exatamente `RESEND_API_KEY`? Reiniciou o backend depois de salvar?

- **E-mail não chega**  
  → Em teste, o Resend envia de `onboarding@resend.dev`; pode ir para spam. Confira a pasta de spam e, no Resend, veja a aba **Logs** para ver se o envio foi aceito.

- **Arquivo `.env` não existe em `server`**  
  → Crie um novo arquivo chamado `.env` dentro da pasta `server` e coloque pelo menos:  
  `RESEND_API_KEY=re_sua_chave_aqui`

Seguindo esses passos, o aplicativo fica conectado à API Resend e o envio de e-mails passa a funcionar por ela. Se quiser, depois podemos conferir juntos um teste de cadastro para ver o e-mail de boas-vindas saindo pelo Resend.
