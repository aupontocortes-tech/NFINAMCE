@echo off
title NFinance - Diagnostico
color 0E
cls

echo ============================================
echo    DIAGNOSTICO DO NFINANCE
echo ============================================
echo.

echo [1] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado!
    echo Instale Node.js de: https://nodejs.org
    pause
    exit /b 1
) else (
    echo [OK] Node.js instalado
    node --version
)
echo.

echo [2] Verificando dependencias do Backend...
cd /d "%~dp0server"
if not exist "node_modules" (
    echo [AVISO] Dependencias do backend nao instaladas
    echo Instalando agora...
    call npm install
    if errorlevel 1 (
        echo [ERRO] Falha ao instalar dependencias do backend
        pause
        exit /b 1
    )
) else (
    echo [OK] Dependencias do backend encontradas
)
cd /d "%~dp0"
echo.

echo [3] Verificando dependencias do Frontend...
if not exist "node_modules" (
    echo [AVISO] Dependencias do frontend nao instaladas
    echo Instalando agora...
    call npm install
    if errorlevel 1 (
        echo [ERRO] Falha ao instalar dependencias do frontend
        pause
        exit /b 1
    )
) else (
    echo [OK] Dependencias do frontend encontradas
)
echo.

echo [4] Verificando portas 3000 e 3001...
netstat -ano | findstr ":3000" >nul
if not errorlevel 1 (
    echo [AVISO] Porta 3000 esta em uso!
    echo Feche outros programas usando esta porta
)
netstat -ano | findstr ":3001" >nul
if not errorlevel 1 (
    echo [AVISO] Porta 3001 esta em uso!
    echo Feche outros programas usando esta porta
)
echo.

echo [5] Testando Backend...
cd /d "%~dp0server"
echo Tentando iniciar backend por 10 segundos...
start /B node src/server.js > backend-test.log 2>&1
timeout /t 10 /nobreak >nul
taskkill /F /IM node.exe >nul 2>&1
if exist backend-test.log (
    echo Ultimas linhas do log do backend:
    powershell -Command "Get-Content backend-test.log -Tail 5"
    del backend-test.log
)
cd /d "%~dp0"
echo.

echo ============================================
echo    DIAGNOSTICO CONCLUIDO
echo ============================================
echo.
echo Se tudo estiver OK, tente executar START.bat
echo.
pause
