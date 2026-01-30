@echo off
chcp 65001 >nul
echo ========================================
echo   Iniciando NFinance
echo ========================================
echo.

echo Liberando portas 3000 e 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001" ^| findstr "LISTENING"') do taskkill /F /PID %%a 2>nul
timeout /t 2 /nobreak >nul
echo.

echo [1/2] Iniciando Backend (porta 3001)...
start "NFinance Backend" cmd /k "cd /d %~dp0server && npm start"

timeout /t 5 /nobreak >nul

echo [2/2] Iniciando Frontend (porta 3000)...
start "NFinance Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo Aguardando o frontend subir (15 segundos)...
timeout /t 15 /nobreak >nul

echo Abrindo http://localhost:3000 no navegador...
start http://localhost:3000

echo.
echo ========================================
echo   Servidores iniciados!
echo   App: http://localhost:3000
echo   Backend: http://localhost:3001
echo ========================================
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause >nul
