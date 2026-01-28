# Script para testar se os servidores estão rodando
Write-Host "🔍 Testando servidores..." -ForegroundColor Cyan
Write-Host ""

# Testa Backend
Write-Host "📡 Testando Backend (porta 3001)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -TimeoutSec 2 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend está RODANDO!" -ForegroundColor Green
        Write-Host "   Resposta: $($response.Content)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Backend NÃO está rodando" -ForegroundColor Red
    Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host "   Execute: cd server && npm start" -ForegroundColor Yellow
}

Write-Host ""

# Testa Frontend
Write-Host "🌐 Testando Frontend (porta 3000)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend está RODANDO!" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend NÃO está rodando" -ForegroundColor Red
    Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host "   Execute: npm run dev" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Pressione qualquer tecla para fechar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
