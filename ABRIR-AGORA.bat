@echo off
chcp 65001 >nul
title NFinance - Abrir app
echo.
echo Abrindo o app direto (sem login)...
start http://localhost:3000/teste
echo.
echo Se nao abrir, rode antes: iniciar-tudo.bat
echo Depois acesse: http://localhost:3000/teste
pause
