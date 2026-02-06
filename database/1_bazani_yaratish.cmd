@echo off
chcp 65001 >nul
echo ========================================
echo  CRM baza yaratish (acoustic_crm24db)
echo ========================================
set PSQL="C:\Program Files\PostgreSQL\17\bin\psql.exe"
set DBSCRIPT=%~dp0create_db.sql
set SCHEMA=%~dp0schema.sql

echo.
echo [1/2] Foydalanuvchi va baza yaratilmoqda (postgres parolini kiriting)...
%PSQL% -U postgres -f "%DBSCRIPT%"
if errorlevel 1 (
  echo XATO: Baza yaratilmadi. Postgres parolini to'g'ri kiritganingizni tekshiring.
  pause
  exit /b 1
)

echo.
echo [2/2] Schema yuklanmoqda...
set PGPASSWORD=Acoustic^&2026
%PSQL% -U acoustic_crm24user -d acoustic_crm24db -h localhost -f "%SCHEMA%"
set PGPASSWORD=
if errorlevel 1 (
  echo XATO: Schema yuklanmadi.
  pause
  exit /b 1
)

echo.
echo Tayyor. Endi backend va frontendni ishga tushiring.
pause
