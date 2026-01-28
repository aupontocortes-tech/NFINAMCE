@echo off
title Teste Direto - NFinance
color 0C
cls

echo ============================================
echo   TESTE DIRETO - CAPTURANDO ERROS
echo ============================================
echo.

cd /d "%~dp0server"

echo Testando Backend diretamente...
echo.
echo (Isso vai mostrar TODOS os erros)
echo.
pause

echo.
echo ============================================
echo   EXECUTANDO: node src/server.js
echo ============================================
echo.

node src/server.js

echo.
echo ============================================
echo   FIM DA EXECUCAO
echo ============================================
echo.
echo Se apareceu algum erro acima, COPIE TUDO
echo e me envie!
echo.
pause
