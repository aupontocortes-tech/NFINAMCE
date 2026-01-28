# 🚀 Como Iniciar o NFinance

## Método 1: Script Automático (Mais Fácil) ⭐

### Windows:
1. **Clique duas vezes** no arquivo: `iniciar-tudo.bat`
2. Aguarde os servidores iniciarem (2 janelas vão abrir)
3. Acesse: **http://localhost:3000**

---

## Método 2: Manual (Terminal)

### Passo 1: Iniciar Backend
Abra um terminal e execute:
```bash
cd server
npm start
```
Aguarde ver a mensagem: `🚀 Servidor rodando em http://localhost:3001`

### Passo 2: Iniciar Frontend
Abra **OUTRO** terminal e execute:
```bash
npm run dev
```
Aguarde ver a mensagem: `Ready - started server on 0.0.0.0:3000`

### Passo 3: Acessar
Abra o navegador em: **http://localhost:3000**

---

## Método 3: PowerShell

### Iniciar tudo de uma vez:
```powershell
.\iniciar-tudo.ps1
```

### Ou separadamente:
```powershell
# Terminal 1 - Backend
.\iniciar-backend.ps1

# Terminal 2 - Frontend  
.\iniciar-frontend.ps1
```

---

## ⚠️ Problemas Comuns

### Porta já em uso?
Se der erro de porta ocupada:
1. Feche outros programas usando as portas 3000 ou 3001
2. Ou mate os processos:
   ```powershell
   # Ver processos na porta 3000
   netstat -ano | findstr :3000
   
   # Ver processos na porta 3001
   netstat -ano | findstr :3001
   ```

### Dependências não instaladas?
```bash
# No diretório raiz
npm install

# No diretório server
cd server
npm install
```

### Banco de dados não criado?
O banco SQLite será criado automaticamente na primeira execução em:
`server/data/app.db`

---

## ✅ Verificar se está funcionando

1. **Backend**: http://localhost:3001/health (deve retornar "OK")
2. **Frontend**: http://localhost:3000 (página de login)

---

## 📱 Primeiro Acesso

1. Acesse: http://localhost:3000
2. Clique em **"Registrar"** ou **"Login"**
3. Se for a primeira vez, crie uma conta
4. Após login, você verá o Dashboard
