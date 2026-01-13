import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  puppeteer: {
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
    args: process.env.NODE_ENV === 'production' || process.env.RENDER ? [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--disable-extensions'
    ] : [] // Argumentos mínimos para rodar localmente (Windows/Mac)
  }
};
