# Acoustic CRM - API Documentation

Base URL: `http://localhost:3000/api/v1`

All endpoints (except `/auth/login` and `/auth/register`) require JWT authentication.

**Authentication Header:**
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication

### POST /auth/login
Login to the system.

**Request Body:**
```json
{
  "email": "admin@acoustic.uz",
  "password": "Admin123!"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "admin@acoustic.uz",
    "firstName": "System",
    "lastName": "Administrator",
    "role": {
      "id": "uuid",
      "name": "super_admin"
    },
    "branch": {
      "id": "uuid",
      "name": "Acoustic Tashkent Center"
    },
    "permissions": ["manage_users", "manage_clients", ...]
  }
}
```

### GET /auth/me
Get current user profile.

**Response:** Same as login user object

---

## Clients

### GET /clients
Get all clients with optional filters.

**Query Parameters:**
- `status` - Filter by status (new, contacted, assigned_to_branch, etc.)
- `branchId` - Filter by branch
- `source` - Filter by source platform (instagram, youtube, etc.)
- `search` - Search by name or phone

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "phoneNumber": "+998901234567",
    "email": "john@example.com",
    "source": "instagram",
    "status": "new",
    "branchId": "uuid",
    "branch": {
      "id": "uuid",
      "name": "Acoustic Tashkent Center"
    },
    "channels": [
      {
        "platform": "instagram",
        "username": "johndoe",
        "userId": "12345"
      }
    ],
    "createdAt": "2024-02-05T10:00:00Z"
  }
]
```

### GET /clients/:id
Get single client by ID with full details.

### POST /clients
Create new client.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "phoneNumber": "+998901234567",
  "email": "jane@example.com",
  "source": "telegram",
  "branchId": "uuid",
  "notes": "Interested in hearing aids"
}
```

### PUT /clients/:id
Update client information.

### PUT /clients/:id/status
Update client status (for Kanban).

**Request Body:**
```json
{
  "status": "contacted"
}
```

### POST /clients/merge
Merge two clients by phone number.

**Request Body:**
```json
{
  "primaryClientId": "uuid",
  "secondaryClientId": "uuid"
}
```

### GET /clients/:id/status-history
Get client status change history.

---

## Messages & Conversations

### GET /messages/conversations
Get all conversations from all platforms.

**Response:**
```json
[
  {
    "id": "uuid",
    "platform": "telegram",
    "platformConversationId": "123456",
    "isRead": false,
    "lastMessageAt": "2024-02-05T10:00:00Z",
    "client": {
      "id": "uuid",
      "name": "John Doe"
    },
    "assignedTo": "uuid",
    "assignedUser": {
      "firstName": "Maria",
      "lastName": "Garcia"
    }
  }
]
```

### GET /messages/conversations/:id/messages
Get all messages in a conversation.

### POST /messages/send
Send message to client.

**Request Body:**
```json
{
  "conversationId": "uuid",
  "content": "Hello! How can I help you?"
}
```

### PUT /messages/conversations/:id/read
Mark conversation as read.

---

## Comments

### GET /comments
Get all social media comments with filters.

**Query Parameters:**
- `platform` - instagram, facebook, youtube
- `isRead` - true/false
- `postId` - Filter by specific post

**Response:**
```json
[
  {
    "id": "uuid",
    "platform": "youtube",
    "content": "Great video about hearing aids!",
    "authorName": "John Viewer",
    "postId": "abc123",
    "postUrl": "https://youtube.com/watch?v=abc123",
    "isRead": false,
    "repliedTo": false,
    "createdAt": "2024-02-05T10:00:00Z",
    "client": {
      "id": "uuid",
      "name": "John Viewer"
    }
  }
]
```

### POST /comments/:id/reply
Reply to a comment.

**Request Body:**
```json
{
  "content": "Thank you for your interest! Please call us."
}
```

### PUT /comments/:id/read
Mark comment as read.

---

## SMS

### POST /sms/send
Send SMS to client with branch information.

**Request Body:**
```json
{
  "clientId": "uuid",
  "branchId": "uuid",
  "phoneNumber": "+998901234567"
}
```

**Note:** SMS content is auto-generated with branch details.

### GET /sms/history
Get SMS sending history.

**Query Parameters:**
- `clientId` - Filter by client
- `branchId` - Filter by branch

---

## Analytics

### GET /analytics/dashboard
Get dashboard overview with key metrics.

**Response:**
```json
{
  "totalClients": 1250,
  "newClientsToday": 15,
  "unreadMessages": 23,
  "unreadComments": 8,
  "conversionRate": 32.5,
  "topPlatform": "instagram"
}
```

### GET /analytics/leads-by-platform
Get lead count by platform.

**Query Parameters:**
- `startDate` - ISO date string
- `endDate` - ISO date string

**Response:**
```json
{
  "instagram": 450,
  "youtube": 320,
  "telegram": 280,
  "facebook": 150,
  "whatsapp": 50
}
```

### GET /analytics/branch-performance
Get performance metrics by branch.

### GET /analytics/conversion-funnel
Get conversion funnel data.

---

## Branches

### GET /branches
Get all branches.

### GET /branches/:id
Get single branch.

### POST /branches
Create new branch.

**Request Body:**
```json
{
  "name": "Acoustic Fergana",
  "address": "улица Al-Fergani, 1, Fergana",
  "phone": "+998 73 244 00 00",
  "workingHours": {
    "monday": "09:00-18:00",
    "tuesday": "09:00-18:00",
    "wednesday": "09:00-18:00",
    "thursday": "09:00-18:00",
    "friday": "09:00-18:00",
    "saturday": "09:00-14:00",
    "sunday": "Closed"
  },
  "region": "Fergana"
}
```

### PUT /branches/:id
Update branch.

### DELETE /branches/:id
Delete branch.

---

## Users

### GET /users
Get all users.

### GET /users/:id
Get single user.

### POST /users
Create new user.

**Request Body:**
```json
{
  "email": "user@acoustic.uz",
  "password": "SecurePassword123!",
  "firstName": "Maria",
  "lastName": "Garcia",
  "phone": "+998901234567",
  "roleId": "uuid",
  "branchId": "uuid"
}
```

### PUT /users/:id
Update user.

### DELETE /users/:id
Delete user.

---

## Integrations

### GET /integrations
Get all platform integrations status.

**Response:**
```json
[
  {
    "platform": "telegram",
    "isActive": true,
    "lastSync": "2024-02-05T10:00:00Z",
    "config": {
      "botUsername": "@acoustic_bot"
    }
  },
  {
    "platform": "youtube",
    "isActive": true,
    "lastSync": "2024-02-05T09:55:00Z"
  }
]
```

### POST /integrations/configure
Configure platform integration.

**Request Body:**
```json
{
  "platform": "telegram",
  "config": {
    "botToken": "1234567890:ABCdefGHIjklMNOpqrsTUVwxyz",
    "webhookUrl": "https://your-domain.com/webhooks/telegram"
  }
}
```

### PUT /integrations/:platform/toggle
Enable/disable integration.

**Request Body:**
```json
{
  "isActive": true
}
```

---

## Kanban

### GET /kanban/statuses
Get all kanban statuses.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "New",
    "slug": "new",
    "color": "#3F3091",
    "position": 1,
    "isActive": true
  },
  {
    "id": "uuid",
    "name": "Contacted",
    "slug": "contacted",
    "color": "#F07E22",
    "position": 2,
    "isActive": true
  }
]
```

### POST /kanban/statuses
Create new status.

### PUT /kanban/statuses/:id
Update status.

### DELETE /kanban/statuses/:id
Delete status.

### PUT /kanban/statuses/reorder
Reorder statuses.

**Request Body:**
```json
{
  "statusIds": ["uuid1", "uuid2", "uuid3", "uuid4"]
}
```

---

## Webhooks

### POST /webhooks/telegram
Telegram bot webhook endpoint.

### POST /webhooks/instagram
Instagram webhook endpoint.

### POST /webhooks/facebook
Facebook webhook endpoint.

### POST /webhooks/whatsapp
WhatsApp webhook endpoint.

---

## WebSocket Events

Connect to: `ws://localhost:3000`

### Events from Server:
- `new_message` - New message received
- `new_comment` - New comment received
- `client_updated` - Client information updated
- `status_changed` - Client status changed in kanban

### Events to Server:
- `join_room` - Join specific conversation room
- `typing` - Send typing indicator

---

## Error Responses

All error responses follow this format:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

### Common Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

- General endpoints: 100 requests per minute
- Authentication endpoints: 5 requests per minute
- Webhook endpoints: No rate limit

---

## Pagination

For endpoints that return lists, use these query parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Response includes:**
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## Testing with cURL

```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acoustic.uz","password":"Admin123!"}'

# Get clients (with token)
curl -X GET http://localhost:3000/api/v1/clients \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create client
curl -X POST http://localhost:3000/api/v1/clients \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Client","source":"instagram"}'
```

---

For more information, see the main README.md file.
