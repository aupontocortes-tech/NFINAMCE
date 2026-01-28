@echo off
title Ver Erros do NFinance
color 0C
cls

echo ============================================
echo   CAPTURANDO ERROS DO BACKEND
echo ============================================
echo.

cd /d "%~dp0server"
echo Iniciando backend e capturando erros...
echo.
echo (Aguarde 10 segundos...)
echo.

node src/server.js > ..\erro-backend.log 2>&1 &
timeout /t 10 /nobreak >nul
taskkill /F /IM node.exe >nul 2>&1

if exist "..\erro-backend.log" (
    echo.
    echo ============================================
    echo   ERROS ENCONTRADOS:
    echo ============================================
    echo.
    type "..\erro-backend.log"
    echo.
    echo ============================================
    echo.
    echo O log foi salvo em: erro-backend.log
) else (
    echo Nenhum erro capturado (arquivo nao criado)
)

echo.
pause
