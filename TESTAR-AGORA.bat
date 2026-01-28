@echo off
title Teste NFinance
color 0B
cls

echo ============================================
echo   TESTE COMPLETO - NFINANCE
echo ============================================
echo.

echo [TESTE 1] Verificando Node.js...
where node >nul 2>&1
if errorlevel 1 (
    echo [FALHOU] Node.js nao encontrado no PATH
    echo.
    echo SOLUCAO: Instale Node.js de https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js encontrado
node --version
echo.

echo [TESTE 2] Verificando npm...
where npm >nul 2>&1
if errorlevel 1 (
    echo [FALHOU] npm nao encontrado
    pause
    exit /b 1
)
echo [OK] npm encontrado
npm --version
echo.

echo [TESTE 3] Verificando dependencias do Backend...
cd /d "%~dp0server"
if not exist "node_modules" (
    echo [AVISO] node_modules nao existe - instalando...
    call npm install
    if errorlevel 1 (
        echo [ERRO] Falha ao instalar dependencias do backend
        echo.
        echo Veja o erro acima e me envie a mensagem
        pause
        exit /b 1
    )
) else (
    echo [OK] Dependencias do backend encontradas
)
cd /d "%~dp0"
echo.

echo [TESTE 4] Verificando dependencias do Frontend...
if not exist "node_modules" (
    echo [AVISO] node_modules nao existe - instalando...
    call npm install
    if errorlevel 1 (
        echo [ERRO] Falha ao instalar dependencias do frontend
        echo.
        echo Veja o erro acima e me envie a mensagem
        pause
        exit /b 1
    )
) else (
    echo [OK] Dependencias do frontend encontradas
)
echo.

echo [TESTE 5] Verificando se portas estao livres...
netstat -ano | findstr ":3000" >nul
if not errorlevel 1 (
    echo [AVISO] Porta 3000 esta em uso!
    echo Vou tentar matar processos Node...
    taskkill /F /IM node.exe >nul 2>&1
    timeout /t 2 /nobreak >nul
)
netstat -ano | findstr ":3001" >nul
if not errorlevel 1 (
    echo [AVISO] Porta 3001 esta em uso!
    taskkill /F /IM node.exe >nul 2>&1
    timeout /t 2 /nobreak >nul
)
echo [OK] Portas livres
echo.

echo [TESTE 6] Tentando iniciar Backend...
echo.
echo ============================================
echo   INICIANDO BACKEND (aguarde 15 segundos)
echo ============================================
echo.
cd /d "%~dp0server"
start "BACKEND-TESTE" cmd /k "echo TESTE DO BACKEND && echo. && npm start && echo. && echo Pressione qualquer tecla para fechar... && pause"
echo.
echo Aguardando 15 segundos para ver se inicia...
timeout /t 15 /nobreak >nul
echo.

echo [TESTE 7] Verificando se Backend respondeu...
cd /d "%~dp0"
powershell -Command "$ErrorActionPreference='Stop'; try { $r = Invoke-WebRequest -Uri 'http://localhost:3001/health' -TimeoutSec 3; Write-Host '[SUCESSO] Backend esta RODANDO!' -ForegroundColor Green; Write-Host 'Resposta:' $r.Content } catch { Write-Host '[FALHOU] Backend nao respondeu' -ForegroundColor Red; Write-Host 'Erro:' $_.Exception.Message -ForegroundColor Yellow }"
echo.

echo ============================================
echo   TESTE CONCLUIDO
echo ============================================
echo.
echo Se o backend iniciou com sucesso, agora vou
echo iniciar o frontend...
echo.
pause

echo.
echo [TESTE 8] Iniciando Frontend...
echo.
cd /d "%~dp0"
start "FRONTEND-TESTE" cmd /k "echo TESTE DO FRONTEND && echo. && npm run dev && echo. && echo Pressione qualquer tecla para fechar... && pause"

echo.
echo ============================================
echo   AMBOS OS SERVIDORES FORAM INICIADOS
echo ============================================
echo.
echo Aguarde 10-15 segundos e depois acesse:
echo   http://localhost:3000
echo.
echo Se nao funcionar, veja as janelas que abriram
echo e me envie as mensagens de erro que aparecerem
echo.
pause
