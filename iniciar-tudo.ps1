# Script para iniciar Backend e Frontend
Write-Host "🚀 Iniciando NFinance..." -ForegroundColor Cyan
Write-Host ""

# Inicia Backend em nova janela
Write-Host "📡 Iniciando Backend (porta 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\server'; npm start"

# Aguarda 3 segundos
Start-Sleep -Seconds 3

# Inicia Frontend em nova janela
Write-Host "🌐 Iniciando Frontend (porta 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run dev"

Write-Host ""
Write-Host "✅ Servidores iniciados!" -ForegroundColor Green
Write-Host "📱 Acesse: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione qualquer tecla para fechar esta janela..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
