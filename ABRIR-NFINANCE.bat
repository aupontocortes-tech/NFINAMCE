@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo   ============================================
echo     NFinance - Abrindo o app pra voce
echo   ============================================
echo.
echo   1. Va abrir DUAS janelas pretas. NAO FECHE NENHUMA.
echo   2. Espere uns 30 segundos (ate aparecer "Ready" em uma delas).
echo   3. O navegador vai abrir sozinho no app.
echo.
echo   Se nao abrir, digite no navegador: http://localhost:3000/testehttp:
echo   Login: demo@nfinance.com   Senha: demo123
echo.
echo   ============================================
echo.

call "%~dp0iniciar-tudo.bat"
