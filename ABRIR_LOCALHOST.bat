@echo off
chcp 65001 >nul
echo.
echo Abrindo o app no navegador...
start http://localhost:3000
echo.
echo Se nao abrir ou ficar em branco:
echo 1. Feche outras janelas do Cursor/terminal que estejam rodando npm.
echo 2. Na pasta do projeto, de duplo clique em: iniciar-tudo.bat
echo 3. Espere aparecer "Ready" na janela do Frontend.
echo 4. Acesse: http://localhost:3000
echo.
echo Login demo: demo@nfinance.com / demo123
echo.
timeout /t 5 /nobreak >nul
