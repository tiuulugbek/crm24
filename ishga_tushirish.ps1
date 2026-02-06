# CRM loyihasini ketma-ket ishga tushirish
# Ishga tushirish: .\ishga_tushirish.ps1

$ErrorActionPreference = "Stop"
$crmRoot = $PSScriptRoot
$backendPort = 3300
$frontendPort = 3301

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Acoustic CRM - Ketma-ket ishga tushirish" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Portlarni bo'shatish (agar band bo'lsa)
Write-Host "[1/4] Port $backendPort va $frontendPort tekshirilmoqda..." -ForegroundColor Yellow
foreach ($port in @($backendPort, $frontendPort)) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($conn) {
        Write-Host "      Port $port band. Process to'xtatilmoqda (PID: $($conn.OwningProcess))..." -ForegroundColor Gray
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
}
Write-Host "      Tayyor." -ForegroundColor Green
Write-Host ""

# 2. Backend ishga tushirish
Write-Host "[2/4] Backend ishga tushirilmoqda (port $backendPort)..." -ForegroundColor Yellow
$backendCmd = "Set-Location '$crmRoot\backend'; npm run start:dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd
Write-Host "      Backend yangi oynada ochildi. Kutish 15 soniya..." -ForegroundColor Gray
Start-Sleep -Seconds 15
Write-Host "      Backend ishga tushdi." -ForegroundColor Green
Write-Host ""

# 3. Frontend ishga tushirish
Write-Host "[3/4] Frontend ishga tushirilmoqda (port $frontendPort)..." -ForegroundColor Yellow
$frontendCmd = "Set-Location '$crmRoot\frontend'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd
Write-Host "      Frontend yangi oynada ochildi. Kutish 8 soniya..." -ForegroundColor Gray
Start-Sleep -Seconds 8
Write-Host "      Frontend ishga tushdi." -ForegroundColor Green
Write-Host ""

# 4. Brauzerni ochish
Write-Host "[4/4] Brauzer ochilmoqda..." -ForegroundColor Yellow
Start-Process "http://localhost:$frontendPort"
Write-Host "      Brauzer ochildi." -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Tayyor!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:$backendPort" -ForegroundColor White
Write-Host "  Frontend: http://localhost:$frontendPort" -ForegroundColor White
Write-Host "  Login:    admin@acoustic.uz / Admin123!" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
