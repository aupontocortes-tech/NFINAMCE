@echo off
title NFinance
cls

echo Iniciando Backend...
start "Backend" cmd /k "cd /d %~dp0server && npm start"

timeout /t 5 /nobreak >nul

echo Iniciando Frontend...
start "Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo Servidores iniciando...
echo Aguarde e acesse: http://localhost:3000
echo.
pause
