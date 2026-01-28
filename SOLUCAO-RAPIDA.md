# 🚨 SOLUÇÃO RÁPIDA - NFinance não abre

## ✅ PASSO A PASSO PARA RESOLVER

### 1️⃣ PRIMEIRO: Execute o Diagnóstico
Clique duas vezes em: **`DIAGNOSTICO.bat`**

Isso vai verificar:
- ✅ Se Node.js está instalado
- ✅ Se as dependências estão instaladas
- ✅ Se as portas estão livres
- ✅ Se há erros no backend

---

### 2️⃣ DEPOIS: Tente Iniciar

**Opção A - Script Simples:**
```
Clique em: START-SIMPLES.bat
```

**Opção B - Script Completo:**
```
Clique em: START.bat
```

**Opção C - Manual (2 terminais):**

**Terminal 1:**
```bash
cd server
npm start
```

**Terminal 2:**
```bash
npm run dev
```

---

### 3️⃣ VERIFICAR SE FUNCIONOU

Abra seu navegador e acesse:
- **http://localhost:3000** (deve abrir a tela de login)

Se não abrir, verifique:
- As janelas do terminal estão abertas?
- Há mensagens de erro nas janelas?
- As portas 3000 e 3001 estão livres?

---

## 🔍 PROBLEMAS COMUNS

### ❌ "Porta já em uso"
**Solução:**
1. Feche outros programas
2. Ou mate processos Node:
   ```powershell
   taskkill /F /IM node.exe
   ```

### ❌ "Dependências não instaladas"
**Solução:**
```bash
# Na raiz do projeto
npm install

# No servidor
cd server
npm install
```

### ❌ "Node.js não encontrado"
**Solução:**
1. Baixe Node.js: https://nodejs.org
2. Instale a versão LTS
3. Reinicie o computador

### ❌ Janelas abrem e fecham rapidamente
**Solução:**
1. Execute `DIAGNOSTICO.bat` primeiro
2. Veja os erros que aparecem
3. Me envie as mensagens de erro

---

## 📞 PRECISA DE AJUDA?

Se nada funcionar:
1. Execute `DIAGNOSTICO.bat`
2. Copie TODAS as mensagens que aparecerem
3. Me envie essas mensagens

---

## ✅ QUANDO FUNCIONAR

1. Acesse: **http://localhost:3000**
2. Clique em **"Registrar"** ou **"Login"**
3. Qualquer email/senha funciona (modo dev)
4. Você verá o Dashboard!
