# CRM loyihasini lokalda ishga tushirish (Windows)

## Tayyor bo‘lgan qismlar
- Backend va frontend dependency’lari o‘rnatilgan
- Backend `.env` va frontend `.env.local` yaratilgan
- Backend kod xatolari tuzatilgan (Auth + Clients modullari ishlaydi)

## 1. PostgreSQL sozlash

Loyiha PostgreSQL dan foydalanadi. Agar PostgreSQL o‘rnatilmagan bo‘lsa:
- [PostgreSQL Windows](https://www.postgresql.org/download/windows/) dan yuklab o‘ling va o‘rnating.

### Bazani yaratish (psql yoki pgAdmin orqali)

**Variant A – psql (Command Line):**
```powershell
# PostgreSQL bin papkasiga o‘ting (masalan):
cd "C:\Program Files\PostgreSQL\16\bin"

# postgres foydalanuvchisi bilan kirish
.\psql -U postgres

# SQL rejimida:
CREATE USER acoustic_crm24user WITH PASSWORD 'Acoustic&2026';
CREATE DATABASE acoustic_crm24db OWNER acoustic_crm24user;
\q

# Schema’ni yuklash
.\psql -U acoustic_crm24user -d acoustic_crm24db -f "C:\Users\AzzaPRO\Desktop\crm\database\schema.sql"
```

**Variant B – mavjud `postgres` foydalanuvchisi bilan:**
```powershell
.\psql -U postgres -c "CREATE DATABASE acoustic_crm24db;"
.\psql -U postgres -d acoustic_crm24db -f "C:\Users\AzzaPRO\Desktop\crm\database\schema.sql"
```

`backend\.env` da baza sozlamalari (loyihada standart):
```env
DATABASE_USER=acoustic_crm24user
DATABASE_PASSWORD=Acoustic&2026
DATABASE_NAME=acoustic_crm24db
```

## 2. Ketma-ket ishga tushirish (bitta buyruq)

**Variant A – skript orqali (tavsiya etiladi):**
- `C:\Users\AzzaPRO\Desktop\crm\ishga_tushirish.cmd` faylini ikki marta bosing, yoki
- PowerShell da: `cd C:\Users\AzzaPRO\Desktop\crm` → `.\ishga_tushirish.ps1`

Skript avtomatik ravishda:
1. 3300 va 3301 portlarni bo‘shatadi (agar band bo‘lsa)
2. Backendni yangi oynada ishga tushiradi
3. 15 soniya kutadi
4. Frontendni yangi oynada ishga tushiradi
5. Brauzerni http://localhost:3301 ga ochadi

**Variant B – qo‘lda ketma-ket:**
1. Backend: `cd C:\Users\AzzaPRO\Desktop\crm\backend` → `npm run start:dev`
2. Yangi terminalda frontend: `cd C:\Users\AzzaPRO\Desktop\crm\frontend` → `npm run dev`
3. Brauzerda: http://localhost:3301

Muvaffaqiyatli ishga tushganda:
- Backend: **http://localhost:3300**
- Frontend: **http://localhost:3301**

## 4. Dasturga kirish

Schema’ni yuklaganingizda README’dagi default login ishlashi kerak:
- **Email:** admin@acoustic.uz  
- **Password:** Admin123!

(Agar schema’da bu foydalanuvchi yaratilmagan bo‘lsa, avval `database/schema.sql` faylini to‘liq ishlatganingizni tekshiring.)

## Qisqacha
1. PostgreSQL o‘rnating va `acoustic_crm` bazasini yarating.
2. `database/schema.sql` ni shu bazaga yuklang.
3. `backend\.env` da `DATABASE_*` qiymatlarini to‘g‘ri qiling.
4. Backend: `cd backend` → `npm run start:dev`
5. Frontend: `cd frontend` → `npm run dev`
6. Brauzerda http://localhost:3301 oching.
