# Boshqa serverda pull qilib ishga tushirish

Bu qadamlar **yangi server**da (Linux/Windows) loyihani clone qilib ishga tushirish uchun.

## 1. Repozitoriyani clone qilish

```bash
git clone https://github.com/tiuulugbek/crm24.git
cd crm24
```

## 2. PostgreSQL bazasini yaratish

```bash
# Linux/Mac
sudo -u postgres createdb acoustic_crm
# yoki
createdb -U postgres acoustic_crm

# Windows: pgAdmin yoki psql orqali "acoustic_crm" nomli database yarating
```

## 3. Schema va migratsiyalarni qo‘llash

```bash
# Asosiy jadvallar
psql -U postgres -d acoustic_crm -f database/schema.sql

# Qo‘shimcha migratsiyalar (agar kerak bo‘lsa)
psql -U postgres -d acoustic_crm -f database/migrations/001_integrations_multiple_per_platform.sql
psql -U postgres -d acoustic_crm -f database/migrations/002_roles_call_center.sql
psql -U postgres -d acoustic_crm -f database/migrations/003_branches_sms_template.sql
```

Xato bo‘lsa (masalan “already exists”) — o‘sha migratsiyani o‘tkazib yuboring.

## 4. Backend sozlash

```bash
cd backend
cp .env.example .env
# .env ni tahrirlang: DATABASE_*, JWT_SECRET, PORT, FRONTEND_URL, WEBHOOK_BASE_URL va b.
nano .env   # yoki code .env

npm install
npm run build
# Development: npm run start:dev
# Production: npm run start
```

**Minimal .env (majburiy):**

- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`
- `JWT_SECRET` — uzun tasodifiy satr
- `PORT=3000`
- `FRONTEND_URL` — frontend manzili (masalan `http://localhost:3301` yoki `https://your-domain.com`)
- `WEBHOOK_BASE_URL` — serverning tashqariga ochiq URL (Telegram webhook uchun, masalan `https://your-domain.com`)

## 5. Frontend sozlash

```bash
cd ../frontend
cp .env.example .env.local
# .env.local da VITE_API_URL ni backend manziliga qiling:
# Lokal: VITE_API_URL=http://localhost:3000/api/v1
# Server IP: VITE_API_URL=http://192.168.1.10:3000/api/v1
# Domain: VITE_API_URL=https://api.your-domain.com/api/v1

npm install
npm run build
# Development: npm run dev
# Production: build qilingan dist/ ni nginx yoki boshqa serverda xizmat qiling
```

## 6. Ishga tushirish

**Development (ikki terminal):**

```bash
# Terminal 1 — backend
cd backend && npm run start:dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

Frontend odatda: http://localhost:3301  
Backend API: http://localhost:3000/api/v1

**Production (misol):**

- Backend: `cd backend && npm run build && node dist/main.js` yoki PM2
- Frontend: `cd frontend && npm run build` — keyin `dist/` ni nginx root qiling

## 7. Dasturga kirish

Schema.sql da default admin qo‘yilgan:

- **Email:** admin@acoustic.uz  
- **Parol:** Admin123!

Birinchi kirishdan keyin parolni o‘zgartiring.

---

**Muammo bo‘lsa:** README.md va TASHQARIDAN_ULANISH.md fayllariga qarang.
