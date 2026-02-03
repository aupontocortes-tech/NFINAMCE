@echo off
chcp 65001 >nul
title NFinance - Rodar no Localhost
echo.
echo ========================================
echo   NFinance - Iniciando para localhost
echo ========================================
echo.

echo Liberando portas 3000 e 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001" ^| findstr "LISTENING"') do taskkill /F /PID %%a 2>nul
timeout /t 2 /nobreak >nul
echo.

echo [1/2] Iniciando Backend...
start "NFinance Backend" cmd /k "cd /d %~dp0server && npm start"
timeout /t 5 /nobreak >nul

echo [2/2] Iniciando Frontend...
start "NFinance Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo Aguardando o app subir (20 segundos)...
timeout /t 20 /nobreak >nul

echo.
echo Abrindo http://localhost:3000 no navegador...
start http://localhost:3000

echo.
echo ========================================
echo   Pronto!
echo   Link: http://localhost:3000
echo   Login: demo@nfinance.com / demo123
echo ========================================
echo   NAO FECHE as janelas Backend e Frontend.
echo   Feche apenas esta janela se quiser.
echo ========================================
echo.
pause
