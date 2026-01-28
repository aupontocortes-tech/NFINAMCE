# 🚨 NFinance Não Abre - Guia de Solução

## ⚡ SOLUÇÃO RÁPIDA

### 1. Execute este arquivo primeiro:
```
INICIAR.bat
```

Isso vai abrir 2 janelas (Backend e Frontend).

### 2. O que fazer:

**✅ Se as janelas abrirem e mostrarem mensagens:**
- Aguarde 10-15 segundos
- Veja se aparece algum ERRO em vermelho
- Se aparecer erro, **COPIE A MENSAGEM** e me envie

**❌ Se as janelas fecharem rapidamente:**
- Execute: `VER-ERROS.bat`
- Isso vai capturar os erros
- Me envie o conteúdo do arquivo `erro-backend.log`

**❌ Se nada acontecer:**
- Execute: `TESTAR-AGORA.bat`
- Esse script testa tudo passo a passo
- Me envie TODAS as mensagens que aparecerem

---

## 🔍 PROBLEMAS COMUNS E SOLUÇÕES

### Problema 1: "Cannot find module"
**Causa:** Dependências não instaladas

**Solução:**
```bash
# Abra um terminal na pasta do projeto
cd server
npm install

# Depois na raiz
cd ..
npm install
```

---

### Problema 2: "Port already in use"
**Causa:** Porta 3000 ou 3001 já está em uso

**Solução:**
```powershell
# Mate todos os processos Node
taskkill /F /IM node.exe

# Depois tente novamente
```

---

### Problema 3: "better-sqlite3" erro
**Causa:** Problema com compilação nativa no Windows

**Solução:**
```bash
cd server
npm install --build-from-source better-sqlite3
```

Ou instale o Visual Studio Build Tools:
https://visualstudio.microsoft.com/downloads/

---

### Problema 4: "Node.js não encontrado"
**Causa:** Node.js não está instalado ou não está no PATH

**Solução:**
1. Baixe Node.js: https://nodejs.org
2. Instale a versão LTS
3. Reinicie o computador
4. Teste: `node --version` no terminal

---

## 📋 CHECKLIST

Antes de me pedir ajuda, verifique:

- [ ] Node.js está instalado? (`node --version`)
- [ ] npm está funcionando? (`npm --version`)
- [ ] Dependências instaladas? (pasta `node_modules` existe)
- [ ] Portas 3000 e 3001 estão livres?
- [ ] Executei `INICIAR.bat` e vi as janelas?
- [ ] Copiei as mensagens de erro?

---

## 🆘 PRECISO DE AJUDA

Se nada funcionar, me envie:

1. **Resultado de:** `node --version`
2. **Resultado de:** `npm --version`
3. **Conteúdo do arquivo:** `erro-backend.log` (se existir)
4. **Mensagens de erro** das janelas que abrem
5. **Sistema Operacional:** Windows 10/11?

---

## ✅ QUANDO FUNCIONAR

1. Acesse: **http://localhost:3000**
2. Você verá a tela de login
3. Clique em "Registrar" ou "Login"
4. Qualquer email/senha funciona (modo dev)
5. Dashboard aparecerá!
