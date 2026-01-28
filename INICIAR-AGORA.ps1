# Script PowerShell para iniciar Backend e Frontend
Write-Host "🚀 Iniciando NFinance..." -ForegroundColor Cyan
Write-Host ""

# Verifica se está no diretório correto
if (-not (Test-Path "server")) {
    Write-Host "❌ Erro: Execute este script na raiz do projeto!" -ForegroundColor Red
    exit 1
}

# Verifica se node_modules existe
if (-not (Test-Path "server\node_modules")) {
    Write-Host "📦 Instalando dependências do backend..." -ForegroundColor Yellow
    Set-Location server
    npm install
    Set-Location ..
}

if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências do frontend..." -ForegroundColor Yellow
    npm install
}

# Cria pasta data se não existir
if (-not (Test-Path "server\data")) {
    New-Item -ItemType Directory -Path "server\data" -Force | Out-Null
}

# Verifica se .env existe
if (-not (Test-Path "server\.env")) {
    Write-Host "⚠️ Arquivo .env não encontrado. Criando..." -ForegroundColor Yellow
    Copy-Item "server\.env.example" "server\.env" -ErrorAction SilentlyContinue
    Write-Host "✅ Arquivo .env criado. Configure RESEND_API_KEY se quiser usar emails." -ForegroundColor Green
}

Write-Host ""
Write-Host "📡 Iniciando Backend (porta 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\server'; npm start"

Start-Sleep -Seconds 3

Write-Host "🌐 Iniciando Frontend (porta 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run dev"

Write-Host ""
Write-Host "✅ Servidores iniciados!" -ForegroundColor Green
Write-Host "📱 Acesse: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Dica: Configure RESEND_API_KEY em server/.env para usar emails" -ForegroundColor Yellow
Write-Host ""
Write-Host "Pressione qualquer tecla para fechar esta janela..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
