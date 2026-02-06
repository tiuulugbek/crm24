# Acoustic CRM — Git pull va ishga tushirish (qisqa qo‘llanma)

## 1. Loyihani Gitdan olish

```bash
# Birinchi marta: clone
git clone https://github.com/tiuulugbek/crm24.git
cd crm24

# Keyingi safar: yangilash
git pull
```

---

## 2. Talablar

- **Node.js** 18 yoki undan yuqori  
- **PostgreSQL** 14+  
- **npm** (Node bilan keladi)  
- (Ixtiyoriy) **Redis** — navbatlar uchun; boshlang‘ich ishga tushirish uchun shart emas.

---

## 3. PostgreSQL bazasini yaratish

**Variant A — psql (Windows):**

```powershell
cd "C:\Program Files\PostgreSQL\16\bin"   # o‘rnatilgan versiyangizga qarab o‘zgartiring
.\psql -U postgres
```

SQL ichida:

```sql
CREATE USER acoustic_crm24user WITH PASSWORD 'Acoustic&2026';
CREATE DATABASE acoustic_crm24db OWNER acoustic_crm24user;
\q
```

Schema yuklash (loyiha papkasidagi `database\schema.sql` uchun to‘liq yo‘lni yozing):

```powershell
.\psql -U acoustic_crm24user -d acoustic_crm24db -f "C:\Users\SIZ\Desktop\crm24\database\schema.sql"
```

**Variant B — pgAdmin:**  
Yangi foydalanuvchi va baza yarating, keyin `database/schema.sql` faylini shu bazada bajaring.

---

## 4. Backend sozlash

```bash
cd backend
npm install
```

**`.env` yarating:**  
`backend/.env.example` ni nusxalab `backend/.env` qiling va quyidagilarni to‘g‘rilang:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=acoustic_crm24user
DATABASE_PASSWORD=Acoustic&2026
DATABASE_NAME=acoustic_crm24db

JWT_SECRET=o‘zingizning_uzun_tasodifiy_matningiz
JWT_EXPIRATION=24h

PORT=3300
HOST=0.0.0.0
NODE_ENV=development
FRONTEND_URL=http://localhost:3301
```

(Qolgan API kalitlar — Telegram, YouTube va hokazo — ixtiyoriy; keyinroq qo‘shishingiz mumkin.)

---

## 5. Frontend sozlash

```bash
cd ../frontend
npm install
```

**`.env.local` yarating:**  
`frontend/.env.example` dan nusxa olib `frontend/.env.local` qiling va API manzilini backend portiga moslang:

```env
VITE_API_URL=http://localhost:3300/api/v1
```

---

## 6. Ishga tushirish

**Variant A — skript orqali (tavsiya, Windows):**

- Loyiha ildizida **`ishga_tushirish.cmd`** ni ishga tushiring, yoki  
- PowerShell: `cd crm24` → `.\ishga_tushirish.ps1`

Skript backendni **3300**, frontendni **3301** portida ishga tushiradi va brauzerni ochadi.

**Variant B — qo‘lda:**

1. **Backend:**  
   `cd backend` → `npm run start:dev`  
   (Backend **http://localhost:3300** da ishlashi kerak.)

2. **Frontend:**  
   Yangi terminalda: `cd frontend` → `npm run dev`  
   (Brauzerda ko‘rsatiladigan manzil, masalan **http://localhost:3301** yoki **http://localhost:5173**.)

---

## 7. Dasturga kirish

- **URL:** http://localhost:3301 (yoki frontend terminalda ko‘rsatilgan port).  
- **Login:** `admin@acoustic.uz`  
- **Parol:** `Admin123!`  

(Schema to‘g‘ri yuklangan bo‘lsa, bu login ishlaydi. Keyin parolni o‘zgartiring.)

---

## Qisqacha buyruqlar

| Qadam              | Buyruq |
|--------------------|--------|
| Loyiha ildizi      | `git clone ...` yoki `git pull` |
| Backend o‘rnatish  | `cd backend` → `npm install` |
| Backend .env       | `.env.example` dan `.env` yaratish, PORT=3300, DB to‘ldirish |
| Frontend o‘rnatish | `cd frontend` → `npm install` |
| Frontend .env      | `.env.local` da `VITE_API_URL=http://localhost:3300/api/v1` |
| Ishga tushirish    | `ishga_tushirish.cmd` yoki backend + frontendni alohida `npm run start:dev` / `npm run dev` |

Batafsil: **README.md**, **LOKAL_ISGGA_TUSHIRISH.md**, serverda deploy — **DEPLOY.md**.
