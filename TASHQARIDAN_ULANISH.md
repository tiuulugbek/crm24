# CRM ni tashqaridan (IP orqali) ishlatish

Kompyuteringizda ishlayotgan CRM ga boshqa kompyuter, telefon yoki internet orqali ulanish uchun quyidagilarni qiling.

## 1. Loyihada o‘zgarishlar (allaqachon qo‘shilgan)

- **Backend** `0.0.0.0` da ishlaydi — tashqaridan keladigan so‘rovlar qabul qilinadi.
- **Frontend** (Vite) `--host` bilan ishlaydi — tarmoqdagi boshqa qurilmalar kirishi mumkin.
- **CORS** — IP orqali keladigan frontend (masalan `http://192.168.1.10:3301`) backendga so‘rov yuborishi uchun ruxsat berilgan.

## 2. Kompyuteringizdagi IP ni bilish

- **Lokal tarmoq (uy/ofis ichida):**  
  `ipconfig` (Windows) yoki `ifconfig` (Mac/Linux) — masalan `192.168.1.5`.
- **Internet orqali (boshqa joydan):**  
  [whatismyip.com](https://whatismyip.com) yoki [ifconfig.me](https://ifconfig.me) — bu sizning **umumiy (public) IP** ingiz.

## 3. Ishga tushirish

### Backend (CRM API)

```bash
cd crm/backend
npm run start
# yoki: npm run start:dev
```

Default: `http://0.0.0.0:3000` (portni .env da `PORT=3000` qilib o‘zgartirish mumkin).

### Frontend

```bash
cd crm/frontend
npm run dev
```

Vite konsolda ko‘rsatadi, masalan:  
`Local: http://localhost:3301/` va **`Network: http://192.168.1.5:3301/`**

Tashqaridan kirish uchun **Network** dagi manzilni ishlating.

## 4. Frontend tashqaridan backendga ulanishi uchun

Frontend boshqa qurilma yoki IP orqali ochilganda, API manzili ham shu IP bo‘lishi kerak.

**Variant A — .env da IP ni yozish**

`crm/frontend/.env` yoki `crm/frontend/.env.local`:

```env
# O‘z kompyuteringizning IP si (lokal tarmoqda yoki public IP)
VITE_API_URL=http://192.168.1.5:3000/api/v1
```

IP o‘rniga:
- Uy ichida: `ipconfig` dan olgan IP (masalan `192.168.1.5`)
- Internet orqali: whatismyip.com dan olgan public IP

**Variant B — Har safar boshqa IP dan ochsangiz**

Har safar o‘sha IP uchun `.env` da `VITE_API_URL` ni o‘zgartiring yoki build qilganda environment orqali bering.

## 5. Firewall (brandmauer)

Windows da **3000** (backend) va **3301** (frontend) portlarini oching:

- Windows: “Windows Defender Firewall” → “Advanced settings” → “Inbound Rules” → yangi qoida: TCP, port 3000 va 3301.
- Yoki ishga tushirishda firewall so‘rasa — “Access allow” tanlang.

## 6. Internet orqali ulash (boshqa shahardan, uydan)

- **Router:** Kompyuteringiz “router” orqali internetga chiqsa, **port forwarding** qilish kerak: router sozlamalarida 3000 va 3301 portlarini shu kompyuterning ichki IP siga (masalan 192.168.1.5) yo‘naltiring.
- **Public IP:** `VITE_API_URL` da va brauzerda router ning **public IP** dan foydalaning (whatismyip.com).
- **Xavfsizlik:** To‘g‘ridan-to‘g‘ri kompyuteringizni internetga ochish xavfli. Uzoq muddatda **VPS** (virtual server) yoki **cloud** da deploy qilish yoki **Cloudflare Tunnel** / **ngrok** kabi tunnel xizmatlari yaxshiroq.

## 7. Qisqacha

| Qayerdan       | Frontend manzil           | VITE_API_URL                    |
|----------------|---------------------------|----------------------------------|
| O‘sha kompyuter| http://localhost:3301     | http://localhost:3000/api/v1     |
| Uy tarmog‘i    | http://192.168.1.5:3301   | http://192.168.1.5:3000/api/v1   |
| Internet       | http://PUBLIC_IP:3301     | http://PUBLIC_IP:3000/api/v1     |

Database (PostgreSQL) ham boshqa kompyuterdan kerak bo‘lsa, uni ham 0.0.0.0 (yoki ma’lum interfeys) da qo‘llab-quvvatlash va firewall da 5432 portini ochish kerak.
