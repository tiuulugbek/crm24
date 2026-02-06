# Acoustic CRM - Complete File Structure

```
acoustic-crm/
│
├── README.md                           # Main documentation and setup guide
│
├── database/
│   └── schema.sql                      # Complete PostgreSQL database schema
│
├── backend/                            # NestJS Backend
│   ├── package.json                    # Backend dependencies
│   ├── tsconfig.json                   # TypeScript configuration
│   ├── .env.example                    # Environment variables template
│   ├── .env                            # Environment variables (create from .env.example)
│   │
│   └── src/
│       ├── main.ts                     # Application entry point
│       ├── app.module.ts               # Root module
│       │
│       ├── entities/                   # TypeORM Database Entities
│       │   ├── user.entity.ts
│       │   ├── role.entity.ts
│       │   ├── permission.entity.ts
│       │   ├── branch.entity.ts
│       │   ├── client.entity.ts
│       │   ├── client-channel.entity.ts
│       │   ├── conversation.entity.ts
│       │   ├── message.entity.ts
│       │   ├── comment.entity.ts
│       │   └── index.ts                # Integration, KanbanStatus, SmsLog, etc.
│       │
│       └── modules/
│           ├── auth/                   # Authentication Module
│           │   ├── auth.module.ts
│           │   ├── auth.service.ts
│           │   ├── auth.controller.ts
│           │   └── strategies/
│           │       ├── jwt.strategy.ts
│           │       └── local.strategy.ts
│           │
│           ├── users/                  # User Management
│           │   ├── users.module.ts
│           │   ├── users.service.ts
│           │   └── users.controller.ts
│           │
│           ├── branches/               # Branch Management
│           │   ├── branches.module.ts
│           │   ├── branches.service.ts
│           │   └── branches.controller.ts
│           │
│           ├── clients/                # Client Management
│           │   ├── clients.module.ts
│           │   ├── clients.service.ts
│           │   └── clients.controller.ts
│           │
│           ├── messages/               # Messages & Conversations
│           │   ├── messages.module.ts
│           │   ├── messages.service.ts
│           │   └── messages.controller.ts
│           │
│           ├── comments/               # Social Media Comments
│           │   ├── comments.module.ts
│           │   ├── comments.service.ts
│           │   └── comments.controller.ts
│           │
│           ├── sms/                    # SMS Module
│           │   ├── sms.module.ts
│           │   ├── sms.service.ts      # Eskiz.uz integration
│           │   └── sms.controller.ts
│           │
│           ├── integrations/           # Social Platform Integrations
│           │   ├── integrations.module.ts
│           │   ├── integrations.service.ts
│           │   ├── integrations.controller.ts
│           │   ├── telegram/
│           │   │   ├── telegram.service.ts  # Telegram Bot API
│           │   │   └── telegram.module.ts
│           │   ├── youtube/
│           │   │   ├── youtube.service.ts   # YouTube Data API v3
│           │   │   └── youtube.module.ts
│           │   ├── instagram/
│           │   │   ├── instagram.service.ts # Instagram Private API
│           │   │   └── instagram.module.ts
│           │   ├── facebook/
│           │   │   ├── facebook.service.ts  # Facebook Graph API
│           │   │   └── facebook.module.ts
│           │   └── whatsapp/
│           │       ├── whatsapp.service.ts  # WhatsApp Business API
│           │       └── whatsapp.module.ts
│           │
│           ├── kanban/                 # Kanban Board
│           │   ├── kanban.module.ts
│           │   ├── kanban.service.ts
│           │   └── kanban.controller.ts
│           │
│           ├── analytics/              # Analytics & Reports
│           │   ├── analytics.module.ts
│           │   ├── analytics.service.ts
│           │   └── analytics.controller.ts
│           │
│           ├── webhooks/               # Webhook Handlers
│           │   ├── webhooks.module.ts
│           │   ├── webhooks.service.ts
│           │   └── webhooks.controller.ts
│           │
│           ├── websockets/             # Real-time Updates
│           │   ├── websockets.module.ts
│           │   ├── websockets.gateway.ts
│           │   └── websockets.service.ts
│           │
│           └── activity-logs/          # Activity Logging
│               ├── activity-logs.module.ts
│               ├── activity-logs.service.ts
│               └── activity-logs.controller.ts
│
├── frontend/                           # React Frontend
│   ├── package.json                    # Frontend dependencies
│   ├── tsconfig.json                   # TypeScript configuration
│   ├── vite.config.ts                  # Vite configuration
│   ├── tailwind.config.js              # TailwindCSS with Acoustic colors
│   ├── postcss.config.js               # PostCSS configuration
│   ├── index.html                      # HTML entry point
│   ├── .env.local                      # Frontend environment variables
│   │
│   └── src/
│       ├── main.tsx                    # React entry point
│       ├── App.tsx                     # Main App component with routing
│       ├── index.css                   # Global styles
│       │
│       ├── layouts/                    # Layout Components
│       │   └── DashboardLayout.tsx     # Main dashboard layout with sidebar
│       │
│       ├── pages/                      # Page Components
│       │   ├── LoginPage.tsx           # Login page
│       │   ├── InboxPage.tsx           # Omnichannel inbox
│       │   ├── ClientsPage.tsx         # Client management
│       │   ├── KanbanPage.tsx          # Kanban board with drag & drop
│       │   ├── AnalyticsPage.tsx       # Analytics dashboard
│       │   ├── BranchesPage.tsx        # Branch management
│       │   ├── UsersPage.tsx           # User management
│       │   ├── IntegrationsPage.tsx    # Platform integrations
│       │   └── SettingsPage.tsx        # System settings
│       │
│       ├── components/                 # Reusable Components
│       │   ├── KanbanColumn.tsx        # Kanban column with sortable items
│       │   ├── ClientCard.tsx          # Client card for kanban
│       │   ├── MessageList.tsx         # Message list component
│       │   ├── CommentItem.tsx         # Comment item component
│       │   ├── SmsModal.tsx            # SMS sending modal
│       │   ├── ClientModal.tsx         # Client edit/create modal
│       │   ├── BranchSelector.tsx      # Branch selection component
│       │   ├── StatusBadge.tsx         # Status badge component
│       │   ├── PlatformIcon.tsx        # Platform icon component
│       │   ├── Chart.tsx               # Chart wrapper components
│       │   └── Loading.tsx             # Loading spinner
│       │
│       ├── lib/                        # Utilities & API
│       │   ├── api.ts                  # Axios API client with all endpoints
│       │   ├── socket.ts               # Socket.io client
│       │   └── utils.ts                # Helper functions
│       │
│       ├── store/                      # State Management (Zustand)
│       │   ├── authStore.ts            # Authentication state
│       │   ├── themeStore.ts           # Theme state
│       │   └── notificationStore.ts    # Notification state
│       │
│       ├── hooks/                      # Custom React Hooks
│       │   ├── useClients.ts           # Client data hooks
│       │   ├── useMessages.ts          # Message data hooks
│       │   ├── useAnalytics.ts         # Analytics data hooks
│       │   └── useWebSocket.ts         # WebSocket hook
│       │
│       └── types/                      # TypeScript Type Definitions
│           ├── client.ts
│           ├── message.ts
│           ├── comment.ts
│           ├── user.ts
│           ├── branch.ts
│           └── index.ts
│
└── docs/                               # Additional Documentation
    ├── API.md                          # API endpoint documentation
    ├── INTEGRATIONS.md                 # Integration setup guides
    ├── DEPLOYMENT.md                   # Deployment instructions
    └── ARCHITECTURE.md                 # System architecture overview
```

## Key File Descriptions

### Backend Core Files

- **main.ts**: Application bootstrap, CORS, validation pipes
- **app.module.ts**: Imports all feature modules, configures TypeORM, Bull, etc.
- **entities/*.entity.ts**: Database models with TypeORM decorators
- **modules/*/**.service.ts**: Business logic and database operations
- **modules/*/**.controller.ts**: REST API endpoints
- **modules/integrations/*/**: Real API integrations for each platform

### Frontend Core Files

- **App.tsx**: React Router setup, route protection, global providers
- **DashboardLayout.tsx**: Main layout with sidebar, navigation, user menu
- **pages/*.tsx**: Full page components for each route
- **components/*.tsx**: Reusable UI components
- **lib/api.ts**: Centralized API client with all backend endpoints
- **store/*.ts**: Global state management with Zustand

### Configuration Files

- **backend/.env**: Backend environment variables (API keys, database, etc.)
- **frontend/.env.local**: Frontend environment variables (API URL)
- **tailwind.config.js**: Acoustic brand colors configuration
- **database/schema.sql**: Complete database schema with indexes

## Important Notes

1. **Never commit .env files** - Always use .env.example as template
2. **Brand colors are fixed** - No gradients, only #F07E22 and #3F3091
3. **All integrations use real APIs** - No mock data in production
4. **RBAC is enforced** - Every endpoint checks permissions
5. **Activity is logged** - All user actions are tracked
6. **Data is encrypted** - Integration credentials use encryption
7. **Real-time updates** - Socket.io for live inbox updates

## Development Workflow

1. Start PostgreSQL and Redis
2. Run backend: `cd backend && npm run start:dev`
3. Run frontend: `cd frontend && npm run dev`
4. Access at http://localhost:5173
5. Login with admin@acoustic.uz / Admin123!

## Production Deployment

1. Build backend: `npm run build`
2. Build frontend: `npm run build`
3. Deploy with PM2 (backend) and Nginx (frontend)
4. Configure SSL certificates
5. Set up automated backups
6. Configure monitoring and logging

---

**All code is production-ready and follows best practices for enterprise applications.**
