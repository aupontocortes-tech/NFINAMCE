@echo off
chcp 65001 >nul
echo ========================================
echo   NFinance - Iniciando tudo
echo ========================================
echo.

echo [1] Liberando portas 3000 e 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001" ^| findstr "LISTENING"') do taskkill /F /PID %%a 2>nul
timeout /t 2 /nobreak >nul
echo.

echo [2] Removendo lock do Next.js (evita erro "another instance")...
if exist "%~dp0.next\dev\lock" del "%~dp0.next\dev\lock"
echo.

echo [3] Iniciando Backend (porta 3001)...
start "NFinance Backend" cmd /k "cd /d %~dp0server & npm run dev"
timeout /t 4 /nobreak >nul

echo [4] Iniciando Frontend (porta 3000)...
start "NFinance Frontend" cmd /k "cd /d %~dp0 & npm run dev"

echo.
echo.
echo NAO FECHE as duas janelas que abriram (Backend e Frontend).
echo Aguardando o frontend compilar (25 segundos)...
echo Quando aparecer "Ready" na janela do Frontend, o app esta no ar.
timeout /t 25 /nobreak >nul

echo.
echo Abrindo o app no navegador (entra direto, sem login)...
start http://localhost:3000/teste

echo.
echo ========================================
echo   Login: demo@nfinance.com
echo   Senha: demo123
echo   URL:  http://localhost:3000
echo ========================================
echo.
echo Se a pagina ficar em branco, espere mais e aperte F5 no navegador.
echo.
pause
