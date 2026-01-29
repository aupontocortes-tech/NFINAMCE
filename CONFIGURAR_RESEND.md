# 📧 Como Configurar o Resend para Envio de Emails

## 🎯 Passo 1: Criar Conta no Resend

1. Acesse [resend.com](https://resend.com)
2. Clique em **"Sign Up"** (pode usar GitHub)
3. Confirme seu email

## 🔑 Passo 2: Obter API Key

1. Após fazer login, vá em **"API Keys"**
2. Clique em **"Create API Key"**
3. Dê um nome (ex: "NFinance Production")
4. Copie a chave (começa com `re_`)

## ⚙️ Passo 3: Configurar no Projeto

### No Localhost (Desenvolvimento):

1. Abra o arquivo: `server/.env`
2. Cole a chave:
   ```
   RESEND_API_KEY=re_sua_chave_aqui
   ```
3. Salve o arquivo
4. Reinicie o servidor backend

### Na Render (Produção):

1. Vá no painel do seu serviço backend na Render
2. Vá em **"Environment"**
3. Adicione a variável:
   - **Key:** `RESEND_API_KEY`
   - **Value:** `re_sua_chave_aqui`
4. Salve e faça **Redeploy**

## ✅ Verificar se Funcionou

Após configurar, quando iniciar o backend, você verá:

```
📧 Serviço de E-mail: Resend inicializado com sucesso.
```

Se não configurar, verá:

```
⚠️ Serviço de E-mail: RESEND_API_KEY não encontrada. Usando fallback.
```

### Testar via API

Com o backend rodando, chame:

```
GET http://localhost:3001/auth/resend-status
```

Resposta se estiver configurado: `{ "resend": true, "message": "API Resend configurada..." }`  
Resposta se não estiver: `{ "resend": false, "message": "RESEND_API_KEY não definida..." }`

**Nota:** O serviço de e-mail do projeto é a API **Resend** (resend.com), não "Resende". Os e-mails (boas-vindas no cadastro, cobranças etc.) só são enviados de verdade quando `RESEND_API_KEY` está definida em `server/.env`.

## 🎯 Domínio Verificado (Opcional)

Por padrão, o Resend usa `onboarding@resend.dev` (funciona para testes).

Para usar seu próprio domínio em produção:
1. Vá em **"Domains"** no Resend
2. Adicione seu domínio
3. Configure o DNS conforme instruções
4. Atualize o `from` no código para usar seu domínio

---

**Pronto!** Agora os emails serão enviados via Resend! 🚀
