@echo off
chcp 65001 >nul
echo ========================================
echo   Iniciando NFinance
echo ========================================
echo.

echo [1/2] Iniciando Backend (porta 3001)...
start "NFinance Backend" cmd /k "cd /d %~dp0server && npm start"

timeout /t 3 /nobreak >nul

echo [2/2] Iniciando Frontend (porta 3000)...
start "NFinance Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ========================================
echo   Servidores iniciados!
echo   Acesse: http://localhost:3000
echo ========================================
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause >nul
