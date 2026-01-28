@echo off
title Resolver Problemas NFinance
color 0E
cls

echo ============================================
echo   RESOLVENDO PROBLEMAS COMUNS
echo ============================================
echo.

echo Este script vai tentar resolver problemas
echo comuns que impedem o NFinance de iniciar.
echo.
pause

echo.
echo [1] Matando processos Node antigos...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo [OK] Processos limpos
echo.

echo [2] Reinstalando dependencias do Backend...
cd /d "%~dp0server"
if exist "node_modules" (
    echo Removendo node_modules antigo...
    rmdir /s /q node_modules >nul 2>&1
)
if exist "package-lock.json" (
    del package-lock.json >nul 2>&1
)
echo Instalando dependencias (isso pode demorar)...
call npm install
if errorlevel 1 (
    echo.
    echo [ERRO] Falha ao instalar dependencias do backend!
    echo.
    echo Tente instalar manualmente:
    echo   cd server
    echo   npm install
    echo.
    pause
    exit /b 1
)
echo [OK] Backend instalado
echo.

echo [3] Reinstalando dependencias do Frontend...
cd /d "%~dp0"
if exist "node_modules" (
    echo Removendo node_modules antigo...
    rmdir /s /q node_modules >nul 2>&1
)
if exist "package-lock.json" (
    del package-lock.json >nul 2>&1
)
echo Instalando dependencias (isso pode demorar)...
call npm install
if errorlevel 1 (
    echo.
    echo [ERRO] Falha ao instalar dependencias do frontend!
    echo.
    echo Tente instalar manualmente:
    echo   npm install
    echo.
    pause
    exit /b 1
)
echo [OK] Frontend instalado
echo.

echo [4] Verificando better-sqlite3 (pode precisar compilar)...
cd /d "%~dp0server"
echo Tentando reinstalar better-sqlite3...
call npm uninstall better-sqlite3 >nul 2>&1
call npm install better-sqlite3
if errorlevel 1 (
    echo.
    echo [AVISO] Problema com better-sqlite3!
    echo.
    echo Se apareceu erro de compilacao, voce precisa:
    echo 1. Instalar Visual Studio Build Tools
    echo 2. Ou usar: npm install --build-from-source better-sqlite3
    echo.
) else (
    echo [OK] better-sqlite3 instalado
)
echo.

echo ============================================
echo   PROBLEMAS RESOLVIDOS!
echo ============================================
echo.
echo Agora tente executar: INICIAR.bat
echo.
pause
