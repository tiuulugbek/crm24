# Acoustic CRM (crm24)

**GitHub:** https://github.com/tiuulugbek/crm24

Boshqa serverda ishga tushirish: **[DEPLOY.md](./DEPLOY.md)** — clone, baza, .env, migratsiya, ishga tushirish qadamlari.

---

## 🎯 Project Overview

Acoustic CRM is a full-stack omnichannel customer relationship management system designed specifically for multi-branch businesses with social media integrations.

### Key Features
- ✅ Omnichannel inbox (Telegram, Instagram, Facebook, WhatsApp, YouTube)
- ✅ Automatic client creation and management
- ✅ Branch-based system with regional assignment
- ✅ Kanban drag-and-drop client flow
- ✅ SMS notifications with branch info
- ✅ Real-time analytics and dashboards
- ✅ Role-based access control (RBAC)
- ✅ Activity logging and audit trails

### Tech Stack
**Backend:**
- NestJS (Node.js framework)
- PostgreSQL (Database)
- TypeORM (ORM)
- Bull (Queue system with Redis)
- JWT Authentication
- Socket.io (Real-time updates)

**Frontend:**
- React 18
- TypeScript
- TailwindCSS (Acoustic brand colors)
- React Query (Data fetching)
- Zustand (State management)
- DnD Kit (Drag and drop)
- Recharts (Analytics)

**Integrations:**
- Telegram Bot API
- Instagram Private API
- Facebook Graph API
- WhatsApp Business API
- YouTube Data API v3
- Eskiz.uz SMS API

---

## 📋 Prerequisites

### Required Software
- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+
- Git

### Required API Keys
1. **Telegram:** Create bot via @BotFather
2. **Instagram:** Business account credentials
3. **Facebook:** Page access token from developers.facebook.com
4. **WhatsApp:** WhatsApp Business API credentials
5. **YouTube:** API key from Google Cloud Console
6. **Eskiz.uz:** SMS service account

---

## 🚀 Installation Steps

### 1. Clone and Setup Database

```bash
# Clone repository
git clone https://github.com/tiuulugbek/crm24.git
cd crm24

# Create PostgreSQL database
createdb acoustic_crm
# Windows: pgAdmin orqali "acoustic_crm" yarating

# Run database schema
psql -U postgres -d acoustic_crm -f database/schema.sql

# Migratsiyalar (ixtiyoriy, yangi jadvallar uchun)
psql -U postgres -d acoustic_crm -f database/migrations/001_integrations_multiple_per_platform.sql
psql -U postgres -d acoustic_crm -f database/migrations/002_roles_call_center.sql
psql -U postgres -d acoustic_crm -f database/migrations/003_branches_sms_template.sql
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env and add your credentials
nano .env
```

**Required .env Configuration:**

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=acoustic_crm

# JWT
JWT_SECRET=generate_random_secret_here
JWT_EXPIRATION=24h

# Server
PORT=3000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_WEBHOOK_URL=https://your-domain.com/webhooks/telegram

# Instagram
INSTAGRAM_USERNAME=your_username
INSTAGRAM_PASSWORD=your_password

# Facebook
FACEBOOK_PAGE_ACCESS_TOKEN=your_token
FACEBOOK_PAGE_ID=your_page_id
FACEBOOK_VERIFY_TOKEN=random_string

# WhatsApp
WHATSAPP_API_URL=your_api_url
WHATSAPP_API_TOKEN=your_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_id

# YouTube
YOUTUBE_API_KEY=your_api_key
YOUTUBE_CHANNEL_ID=your_channel_id

# SMS (Eskiz.uz)
SMS_PROVIDER=eskiz
SMS_EMAIL=your_eskiz_email
SMS_PASSWORD=your_eskiz_password
SMS_FROM=Acoustic

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Encryption
ENCRYPTION_KEY=generate_32_character_key
```

```bash
# Start development server
npm run start:dev
```

Backend will run on http://localhost:3000

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Copy env example and set API URL
cp .env.example .env.local
# .env.local da: VITE_API_URL=http://localhost:3000/api/v1
# Boshqa serverda: VITE_API_URL=http://SERVER_IP:3000/api/v1

# Start development server
npm run dev
```

Frontend will run on http://localhost:5173

### 4. Redis Setup (for queues)

```bash
# Install Redis (Ubuntu/Debian)
sudo apt-get install redis-server

# Start Redis
sudo service redis-server start

# Verify Redis is running
redis-cli ping
# Should return: PONG
```

---

## 🔐 Default Login Credentials

After running the database schema, use these credentials:

```
Email: admin@acoustic.uz
Password: Admin123!
```

**⚠️ IMPORTANT:** Change this password immediately after first login!

---

## 🌐 Integration Setup

### Telegram Bot

1. Create bot via @BotFather on Telegram
2. Copy bot token to `.env`
3. Set webhook (production):
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=https://your-domain.com/api/v1/webhooks/telegram"
```

### YouTube API

1. Go to Google Cloud Console
2. Create new project
3. Enable YouTube Data API v3
4. Create API key
5. Add to `.env`

### Instagram

1. Use Instagram business account
2. Add credentials to `.env`
3. Bot will auto-sync DMs and comments

### Facebook

1. Go to developers.facebook.com
2. Create app
3. Add Messenger product
4. Get page access token
5. Configure webhook

### WhatsApp Business

1. Get WhatsApp Business API credentials
2. Configure webhook
3. Add to `.env`

### SMS (Eskiz.uz)

1. Register at eskiz.uz
2. Add email/password to `.env`
3. System will auto-authenticate

---

## 📱 Usage Guide

### User Roles

1. **Super Admin**
   - Full system access
   - Integration management
   - User and role management

2. **Admin**
   - User management
   - Branch management
   - Kanban configuration

3. **Community Manager**
   - Reply to messages/comments
   - Create and assign clients
   - Send SMS

4. **Branch Admin**
   - View own branch clients only
   - Update client status

5. **Observer**
   - Read-only access to all data

### Main Workflows

#### 1. Omnichannel Inbox
- All messages from all platforms appear in unified inbox
- Click conversation to view history
- Reply directly from CRM
- Auto-creates client on first interaction

#### 2. Client Management
- Auto-created from social interactions
- Manually add clients
- Merge duplicate clients by phone number
- Assign to branches (auto or manual)
- Track full activity history

#### 3. Kanban Board
- Drag and drop clients between statuses
- Default flow: New → Contacted → Assigned → Waiting → Visited → Closed/Lost
- Track time in each status
- View status change history

#### 4. SMS Module
- One-click "Send SMS" from client card
- Select branch
- Auto-generates SMS with branch details:
  - Branch name and address
  - Phone number
  - Working hours
- Full SMS history logging

#### 5. Analytics
- Leads by platform (Instagram vs YouTube etc.)
- Branch performance comparison
- Operator efficiency metrics
- Conversion funnel visualization
- Lost client reasons analysis

---

## 🎨 Design System

### Brand Colors (NO GRADIENTS)

**Primary Orange:** `#F07E22`
- Use for: Primary buttons, active states, highlights

**Secondary Purple:** `#3F3091`
- Use for: Secondary actions, headers, accents

**Neutrals:**
- White backgrounds
- Light gray (`#F3F4F6`) for cards
- Dark gray (`#1F2937`) for dark mode

### Design Principles
- ✅ Flat UI (no gradients)
- ✅ High contrast for readability
- ✅ Medical-tech professional look
- ✅ Clean and simple for non-technical users

---

## 🔧 Development

### Backend Structure
```
backend/
├── src/
│   ├── entities/          # TypeORM entities
│   ├── modules/
│   │   ├── auth/          # Authentication
│   │   ├── clients/       # Client management
│   │   ├── messages/      # Messages & conversations
│   │   ├── comments/      # Social comments
│   │   ├── integrations/  # Platform integrations
│   │   ├── sms/           # SMS service
│   │   ├── analytics/     # Analytics engine
│   │   ├── kanban/        # Kanban board
│   │   ├── branches/      # Branch management
│   │   ├── users/         # User management
│   │   └── webhooks/      # Webhook handlers
│   ├── app.module.ts
│   └── main.ts
└── package.json
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/        # Reusable components
│   ├── pages/             # Page components
│   ├── layouts/           # Layout components
│   ├── lib/               # API client
│   ├── store/             # Zustand stores
│   ├── hooks/             # Custom hooks
│   ├── types/             # TypeScript types
│   ├── App.tsx
│   └── main.tsx
└── package.json
```

### Adding New Integration

1. Create service in `backend/src/modules/integrations/<platform>/`
2. Implement webhook handler
3. Add to `IntegrationsModule`
4. Update database with platform-specific fields
5. Add UI configuration in frontend

---

## 🚀 Production Deployment

### Backend (PM2)

```bash
# Build
npm run build

# Start with PM2
pm2 start dist/main.js --name acoustic-crm-backend

# Save PM2 config
pm2 save
pm2 startup
```

### Frontend (Nginx)

```bash
# Build
npm run build

# Copy to web server
sudo cp -r dist/* /var/www/acoustic-crm/
```

**Nginx Configuration:**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /var/www/acoustic-crm;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Database Backup

```bash
# Backup
pg_dump -U postgres acoustic_crm > backup_$(date +%Y%m%d).sql

# Restore
psql -U postgres acoustic_crm < backup_20240205.sql
```

---

## 📊 Monitoring

### Health Checks

- **Backend:** http://localhost:3000/api/v1/health
- **Database:** Check PostgreSQL logs
- **Redis:** `redis-cli ping`

### Logs

```bash
# Backend logs
pm2 logs acoustic-crm-backend

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 🐛 Troubleshooting

### Database Connection Failed
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Check connection
psql -U postgres -d acoustic_crm -c "SELECT 1"
```

### Redis Connection Failed
```bash
# Check Redis
redis-cli ping

# Restart Redis
sudo service redis-server restart
```

### Telegram Webhook Not Working
```bash
# Check webhook info
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo

# Remove webhook
curl -X POST https://api.telegram.org/bot<TOKEN>/deleteWebhook

# Set webhook again
curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook?url=<YOUR_URL>
```

### YouTube API Quota Exceeded
- YouTube API has daily quota limits
- Reduce sync frequency in cron job
- Request quota increase from Google

---

## 📝 License

Proprietary - Acoustic Hearing Centers

---

## 👥 Support

For technical support:
- Email: support@acoustic.uz
- Phone: +998 71 200 00 00

---

## ✅ Post-Installation Checklist

- [ ] Database schema applied
- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] Redis running
- [ ] All API keys configured
- [ ] Default admin password changed
- [ ] Telegram bot connected
- [ ] YouTube API working
- [ ] SMS provider authenticated
- [ ] SSL certificate installed (production)
- [ ] Firewall rules configured
- [ ] Backup system configured
- [ ] Monitoring setup complete

---

**🎉 Congratulations! Your Acoustic CRM is now ready to use.**
