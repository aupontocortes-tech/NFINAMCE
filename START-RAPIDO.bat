@echo off
chcp 65001 >nul
title NFinance - Inicio rapido
echo.
echo Iniciando Backend e Frontend...
start "Backend" cmd /k "cd /d %~dp0server && npm run dev"
timeout /t 2 /nobreak >nul
start "Frontend" cmd /k "cd /d %~dp0 && npm run dev"
echo.
echo Aguarde aparecer "Ready" na janela do Frontend (pode levar ~30s na primeira vez).
echo Depois acesse: http://localhost:3000
echo.
timeout /t 4 /nobreak >nul
start http://localhost:3000
echo Navegador aberto. Se a pagina nao carregar, aguarde e atualize (F5).
pause
