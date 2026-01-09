# Guia de Deploy e Hospedagem - NFINANCE

## 1. Corrigindo o Erro 404 na Vercel (Tela Branca)

O erro acontece porque o código do site não está na raiz, e sim na pasta `nfinance-web`.

1. Acesse o painel da **Vercel**.
2. Vá em **Settings** > **General**.
3. Em **Root Directory**, clique em `Edit`.
4. Selecione a pasta `nfinance-web`.
5. Salve. A Vercel iniciará um novo deploy automaticamente.

---

## 2. Onde hospedar o Backend (Robô do WhatsApp)?

A Vercel **NÃO** roda o backend do WhatsApp, pois ela é feita para sites estáticos e serverless (que "dormem" quando não usados). O robô do WhatsApp precisa ficar "acordado" 24h.

### Opção A: Uso Misto (Grátis e Simples)
- **Frontend:** Hospedado na Vercel (acessível de qualquer lugar).
- **Backend:** Rodando no seu computador (`npm start` na pasta server).
- **Limitação:** O site na Vercel só vai conectar no WhatsApp se o seu computador estiver ligado e rodando o servidor. Além disso, você precisará configurar o Frontend para apontar para o seu IP ou usar ferramentas como `ngrok` para expor seu localhost.

### Opção B: Hospedagem Profissional (Recomendado para Produção)
Para o robô funcionar sem seu PC ligado, você precisa hospedar a pasta `server` em serviços que suportam Node.js persistente e Puppeteer:
1. **Render.com** (Tem plano grátis, mas desliga após inatividade).
2. **Railway.app** (Pago, mas muito estável).
3. **VPS (DigitalOcean/AWS)** (Configuração manual completa).

### Como configurar a URL do Backend?
Atualmente, o Frontend aponta para `http://localhost:3001`.
Quando você hospedar o backend online, deverá alterar no arquivo:
`nfinance-web/src/components/features/WhatsAppConnect.tsx`
`nfinance-web/src/app/dashboard/students/page.tsx`

Trocando `http://localhost:3001` pela URL do seu novo servidor (ex: `https://meu-backend-nfinance.onrender.com`).
