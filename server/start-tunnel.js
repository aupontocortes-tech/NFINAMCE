const localtunnel = require('localtunnel');

(async () => {
  const tunnel = await localtunnel({ port: 3001, subdomain: 'nfinance-backend' });

  console.log('\n🌍 TÚNEL PÚBLICO ATIVO!');
  console.log(`🔗 Sua URL pública é: ${tunnel.url}`);
  console.log('👉 Use esta URL no seu Frontend se quiser acessar via Vercel/Celular.');
  
  tunnel.on('close', () => {
    console.log('Túnel fechado');
  });
})();
