# NFINANCE Backend

Backend do sistema de gestão para Personal Trainers, responsável pela automação de cobranças via WhatsApp.

## 🚀 Como Rodar

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Inicie o servidor:**
   ```bash
   npm start
   ```

3. **Autentique o WhatsApp:**
   - Ao iniciar, um QR Code será gerado no terminal.
   - Abra o WhatsApp no seu celular, vá em "Dispositivos Conectados" > "Conectar um aparelho".
   - Escaneie o QR Code.

O servidor rodará em `http://localhost:3001`.

## 📡 Endpoints Principais

- `GET /alunos`: Lista todos os alunos.
- `POST /alunos`: Cria um novo aluno.
- `POST /cobrancas/rodar`: Força a execução da verificação de cobranças (igual ao cron diário).

## ⏰ Automação

O sistema verifica diariamente às **09:00** se há cobranças pendentes para o dia atual e envia automaticamente via WhatsApp.
