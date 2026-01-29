#!/usr/bin/env node
/**
 * Garante que .env.local existe com AUTH_SECRET (evita "Server error" do NextAuth).
 * Uso: node scripts/ensure-auth-secret.js (ou npm run setup:auth)
 */
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
const secret = 'nfinance-local-secret-' + require('crypto').randomBytes(16).toString('hex');

let content = '';
if (fs.existsSync(envPath)) {
  content = fs.readFileSync(envPath, 'utf8');
  if (content.includes('AUTH_SECRET=')) {
    console.log('AUTH_SECRET já existe em .env.local');
    process.exit(0);
  }
  content = content.trimEnd() + '\n';
}

content += `# NextAuth - evita "Server error - problem with server configuration"\nAUTH_SECRET=${secret}\n`;
fs.writeFileSync(envPath, content);
console.log('Criado/atualizado .env.local com AUTH_SECRET. Pode rodar: npm run dev');
process.exit(0);
