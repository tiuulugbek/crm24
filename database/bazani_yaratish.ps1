# PostgreSQL baza va foydalanuvchini yaratish
# Ishga tushirish: .\bazani_yaratish.ps1
# Agar postgres parol so'rasa, terminalda kiring

$psql = "C:\Program Files\PostgreSQL\17\bin\psql.exe"
$scriptDir = $PSScriptRoot

# 1. Foydalanuvchi va baza
& $psql -U postgres -f "$scriptDir\create_db.sql"

# 2. Schema yuklash
& $psql -U acoustic_crm24user -d acoustic_crm24db -h localhost -f "$scriptDir\schema.sql"
Write-Host "Baza tayyor." -ForegroundColor Green
