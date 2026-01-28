@echo off
title Corrigir e Testar NFinance
color 0A
cls

echo ============================================
echo   CORRIGINDO E TESTANDO NFINANCE
echo ============================================
echo.

echo [1] Verificando Node.js...
where node >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado!
    pause
    exit /b 1
)
echo [OK] Node.js encontrado
echo.

echo [2] Limpando processos Node...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo [OK] Processos limpos
echo.

echo [3] Verificando dependencias do Backend...
cd /d "%~dp0server"
if not exist "node_modules" (
    echo Instalando dependencias do backend...
    call npm install
    if errorlevel 1 (
        echo [ERRO] Falha ao instalar!
        pause
        exit /b 1
    )
)
echo [OK] Dependencias do backend OK
echo.

echo [4] Verificando dependencias do Frontend...
cd /d "%~dp0"
if not exist "node_modules" (
    echo Instalando dependencias do frontend...
    call npm install
    if errorlevel 1 (
        echo [ERRO] Falha ao instalar!
        pause
        exit /b 1
    )
)
echo [OK] Dependencias do frontend OK
echo.

echo [5] Testando Backend...
echo.
echo ============================================
echo   TESTE DO BACKEND
echo ============================================
echo.
cd /d "%~dp0server"
echo Executando: node src/server.js
echo.
echo (Aguarde 15 segundos para ver se inicia...)
echo.
start "Backend Teste" cmd /k "cd /d %~dp0server && node src/server.js && echo. && echo Pressione qualquer tecla... && pause >nul"

timeout /t 15 /nobreak >nul

echo.
echo Verificando se backend respondeu...
cd /d "%~dp0"
powershell -Command "$ErrorActionPreference='Stop'; try { $r = Invoke-WebRequest -Uri 'http://localhost:3001/health' -TimeoutSec 2; Write-Host '[SUCESSO] Backend esta RODANDO!' -ForegroundColor Green } catch { Write-Host '[FALHOU] Backend nao respondeu' -ForegroundColor Red; Write-Host 'Veja a janela que abriu para ver o erro' -ForegroundColor Yellow }"
echo.

echo ============================================
echo   TESTE CONCLUIDO
echo ============================================
echo.
echo Se o backend iniciou, agora vou iniciar o frontend...
echo.
pause

echo.
echo [6] Iniciando Frontend...
cd /d "%~dp0"
start "Frontend Teste" cmd /k "cd /d %~dp0 && npm run dev && echo. && echo Pressione qualquer tecla... && pause >nul"

echo.
echo ============================================
echo   AMBOS INICIADOS!
echo ============================================
echo.
echo Aguarde 10 segundos e acesse:
echo   http://localhost:3000
echo.
echo Se nao funcionar, veja as janelas que abriram
echo e me envie as mensagens de erro!
echo.
pause
