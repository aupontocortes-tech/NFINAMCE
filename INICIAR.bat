@echo off
title NFinance - Iniciar
color 0A
cls

echo.
echo ========================================
echo   INICIANDO NFINANCE
echo ========================================
echo.

REM Verifica se estamos no diretorio correto
if not exist "server" (
    echo [ERRO] Pasta 'server' nao encontrada!
    echo Execute este script na raiz do projeto.
    pause
    exit /b 1
)

REM Verifica Node.js
where node >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado!
    echo Instale Node.js de: https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js encontrado
echo.

REM Mata processos Node anteriores
echo Limpando processos Node anteriores...
taskkill /F /IM node.exe >nul 2>&1
if errorlevel 0 (
    echo [OK] Processos anteriores encerrados
) else (
    echo [INFO] Nenhum processo Node em execucao
)
timeout /t 2 /nobreak >nul
echo.

REM Verifica dependencias do backend
echo Verificando dependencias do Backend...
cd /d "%~dp0server"
if not exist "node_modules" (
    echo [AVISO] Dependencias nao instaladas!
    echo Instalando agora... (isso pode demorar)
    call npm install
    if errorlevel 1 (
        echo [ERRO] Falha ao instalar dependencias do backend!
        cd /d "%~dp0"
        pause
        exit /b 1
    )
)
cd /d "%~dp0"
echo [OK] Dependencias do backend OK
echo.

REM Verifica dependencias do frontend
echo Verificando dependencias do Frontend...
if not exist "node_modules" (
    echo [AVISO] Dependencias nao instaladas!
    echo Instalando agora... (isso pode demorar)
    call npm install
    if errorlevel 1 (
        echo [ERRO] Falha ao instalar dependencias do frontend!
        pause
        exit /b 1
    )
)
echo [OK] Dependencias do frontend OK
echo.

REM Inicia Backend
echo ========================================
echo [1/2] Iniciando Backend (porta 3001)...
echo ========================================
start "NFinance - Backend" cmd /k "title NFinance Backend - Porta 3001 && color 0B && cd /d %~dp0server && echo. && echo ======================================== && echo   BACKEND - Porta 3001 && echo ======================================== && echo. && echo Iniciando servidor... && echo. && npm start && echo. && echo. && echo Pressione qualquer tecla para fechar esta janela... && pause >nul"

REM Aguarda backend iniciar
echo Aguardando 8 segundos para backend iniciar...
timeout /t 8 /nobreak >nul
echo.

REM Inicia Frontend  
echo ========================================
echo [2/2] Iniciando Frontend (porta 3000)...
echo ========================================
start "NFinance - Frontend" cmd /k "title NFinance Frontend - Porta 3000 && color 0E && cd /d %~dp0 && echo. && echo ======================================== && echo   FRONTEND - Porta 3000 && echo ======================================== && echo. && echo Iniciando servidor... && echo. && npm run dev && echo. && echo. && echo Pressione qualquer tecla para fechar esta janela... && pause >nul"

echo.
echo ========================================
echo   JANELAS ABERTAS!
echo ========================================
echo.
echo Duas janelas foram abertas:
echo   [VERDE]  Backend  - Porta 3001
echo   [AMARELO] Frontend - Porta 3000
echo.
echo ========================================
echo   PROXIMOS PASSOS:
echo ========================================
echo.
echo 1. Veja as janelas que abriram
echo 2. Aguarde 10-15 segundos
echo 3. Procure por mensagens de ERRO (em vermelho)
echo.
echo Se nao houver erros, voce vera:
echo   - Backend:  "Servidor rodando em http://localhost:3001"
echo   - Frontend: "Ready - started server on 0.0.0.0:3000"
echo.
echo 4. Depois acesse no navegador:
echo    http://localhost:3000
echo.
echo ========================================
echo   SE HOUVER ERROS:
echo ========================================
echo.
echo - Copie as mensagens de erro das janelas
echo - Ou execute: VER-ERROS.bat
echo - Me envie as mensagens para eu ajudar
echo.
echo ========================================
echo.
pause
