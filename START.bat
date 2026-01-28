@echo off
title NFinance - Iniciando Servidores
color 0A

echo.
echo ============================================
echo    NFINANCE - Sistema de Gestao
echo ============================================
echo.

echo [PASSO 1] Verificando dependencias...
cd /d "%~dp0server"
if not exist "node_modules" (
    echo ERRO: Dependencias nao instaladas!
    echo Execute: cd server ^&^& npm install
    pause
    exit /b 1
)

cd /d "%~dp0"
if not exist "node_modules" (
    echo ERRO: Dependencias do frontend nao instaladas!
    echo Execute: npm install
    pause
    exit /b 1
)

echo [OK] Dependencias encontradas!
echo.

echo [PASSO 2] Iniciando Backend na porta 3001...
start "NFINANCE Backend" cmd /k "cd /d %~dp0server && echo ======================================== && echo   BACKEND INICIANDO... && echo ======================================== && npm start"

echo Aguardando 5 segundos...
timeout /t 5 /nobreak >nul

echo [PASSO 3] Iniciando Frontend na porta 3000...
start "NFINANCE Frontend" cmd /k "cd /d %~dp0 && echo ======================================== && echo   FRONTEND INICIANDO... && echo ======================================== && npm run dev"

echo.
echo ============================================
echo    Servidores iniciados!
echo.
echo    Backend:  http://localhost:3001
echo    Frontend: http://localhost:3000
echo ============================================
echo.
echo Aguarde alguns segundos para os servidores
echo iniciarem completamente...
echo.
echo Pressione qualquer tecla para fechar...
pause >nul
