-- Acoustic CRM Database Schema
-- PostgreSQL 14+

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- USERS & AUTH
-- ============================================

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50) NOT NULL,
    working_hours JSONB NOT NULL DEFAULT '{}',
    region VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    role_id UUID REFERENCES roles(id),
    branch_id UUID REFERENCES branches(id),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INTEGRATIONS
-- ============================================

CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform VARCHAR(50) NOT NULL, -- telegram, instagram, facebook, whatsapp, youtube
    name VARCHAR(255), -- masalan: "Reklama 1 bot", "Asosiy Instagram" — bir platformada bir nechta ulanish
    config JSONB NOT NULL, -- encrypted credentials and settings
    webhook_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_sync TIMESTAMP,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CLIENTS
-- ============================================

CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    phone_number VARCHAR(50),
    email VARCHAR(255),
    source VARCHAR(50) NOT NULL, -- instagram, telegram, youtube, facebook, whatsapp
    branch_id UUID REFERENCES branches(id),
    status VARCHAR(50) DEFAULT 'new', -- new, contacted, assigned_to_branch, waiting, visited, closed, lost
    tags TEXT[],
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    merged_from UUID[], -- track merged client IDs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE client_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- telegram, instagram, facebook, whatsapp, youtube
    username VARCHAR(255),
    user_id VARCHAR(255), -- platform-specific user ID
    profile_url TEXT,
    metadata JSONB DEFAULT '{}',
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(platform, user_id)
);

-- ============================================
-- MESSAGES & COMMENTS
-- ============================================

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    platform_conversation_id VARCHAR(255) NOT NULL,
    assigned_to UUID REFERENCES users(id),
    is_read BOOLEAN DEFAULT false,
    last_message_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(platform, platform_conversation_id)
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    platform_message_id VARCHAR(255) NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text', -- text, image, video, audio, file
    content TEXT,
    media_url TEXT,
    is_inbound BOOLEAN DEFAULT true,
    is_read BOOLEAN DEFAULT false,
    sender_name VARCHAR(255),
    sender_id VARCHAR(255),
    replied_to UUID REFERENCES messages(id),
    replied_by UUID REFERENCES users(id),
    reply_content TEXT,
    replied_at TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(platform, platform_message_id)
);

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- instagram, facebook, youtube
    platform_comment_id VARCHAR(255) NOT NULL,
    post_id VARCHAR(255) NOT NULL,
    post_url TEXT,
    content TEXT NOT NULL,
    author_name VARCHAR(255),
    author_id VARCHAR(255),
    author_username VARCHAR(255),
    parent_comment_id VARCHAR(255), -- for threaded comments
    is_read BOOLEAN DEFAULT false,
    replied_to BOOLEAN DEFAULT false,
    replied_by UUID REFERENCES users(id),
    reply_content TEXT,
    replied_at TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(platform, platform_comment_id)
);

-- ============================================
-- KANBAN SYSTEM
-- ============================================

CREATE TABLE kanban_statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    color VARCHAR(7) NOT NULL, -- hex color
    position INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE client_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    from_status VARCHAR(50),
    to_status VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES users(id),
    duration_seconds INTEGER, -- time spent in previous status
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SMS MODULE
-- ============================================

CREATE TABLE sms_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id),
    phone_number VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    sent_by UUID REFERENCES users(id),
    provider VARCHAR(50) NOT NULL, -- eskiz, playmobile, etc.
    provider_message_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- pending, sent, delivered, failed
    error_message TEXT,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ANALYTICS
-- ============================================

CREATE TABLE analytics_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    snapshot_date DATE NOT NULL,
    metric_type VARCHAR(100) NOT NULL, -- leads_by_platform, branch_performance, conversion_rate
    metric_key VARCHAR(100), -- platform name, branch id, etc.
    metric_value JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(snapshot_date, metric_type, metric_key)
);

-- ============================================
-- ACTIVITY LOGS
-- ============================================

CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL, -- client, message, comment, etc.
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES
-- ============================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_branch_id ON users(branch_id);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Clients
CREATE INDEX idx_clients_phone_number ON clients(phone_number);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_source ON clients(source);
CREATE INDEX idx_clients_branch_id ON clients(branch_id);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_created_at ON clients(created_at DESC);

-- Client Channels
CREATE INDEX idx_client_channels_client_id ON client_channels(client_id);
CREATE INDEX idx_client_channels_platform ON client_channels(platform);
CREATE INDEX idx_client_channels_user_id ON client_channels(platform, user_id);

-- Conversations
CREATE INDEX idx_conversations_client_id ON conversations(client_id);
CREATE INDEX idx_conversations_platform ON conversations(platform);
CREATE INDEX idx_conversations_assigned_to ON conversations(assigned_to);
CREATE INDEX idx_conversations_is_read ON conversations(is_read);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC);

-- Messages
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_client_id ON messages(client_id);
CREATE INDEX idx_messages_platform ON messages(platform);
CREATE INDEX idx_messages_is_read ON messages(is_read);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Comments
CREATE INDEX idx_comments_client_id ON comments(client_id);
CREATE INDEX idx_comments_platform ON comments(platform);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_is_read ON comments(is_read);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- Client Status History
CREATE INDEX idx_client_status_history_client_id ON client_status_history(client_id);
CREATE INDEX idx_client_status_history_created_at ON client_status_history(created_at DESC);

-- SMS Logs
CREATE INDEX idx_sms_logs_client_id ON sms_logs(client_id);
CREATE INDEX idx_sms_logs_branch_id ON sms_logs(branch_id);
CREATE INDEX idx_sms_logs_status ON sms_logs(status);
CREATE INDEX idx_sms_logs_created_at ON sms_logs(created_at DESC);

-- Analytics
CREATE INDEX idx_analytics_snapshots_date ON analytics_snapshots(snapshot_date DESC);
CREATE INDEX idx_analytics_snapshots_type ON analytics_snapshots(metric_type);

-- Activity Logs
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_resource ON activity_logs(resource_type, resource_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ============================================
-- SEED DATA
-- ============================================

-- Roles
INSERT INTO roles (id, name, description) VALUES
    ('11111111-1111-1111-1111-111111111111', 'super_admin', 'Full system access'),
    ('22222222-2222-2222-2222-222222222222', 'admin', 'System administration'),
    ('33333333-3333-3333-3333-333333333333', 'community_manager', 'Message and client management'),
    ('44444444-4444-4444-4444-444444444444', 'branch_admin', 'Branch-level access'),
    ('55555555-5555-5555-5555-555555555555', 'observer', 'Read-only access');

-- Permissions
INSERT INTO permissions (name, resource, action, description) VALUES
    ('manage_users', 'users', 'manage', 'Create, update, delete users'),
    ('view_users', 'users', 'view', 'View user list'),
    ('manage_roles', 'roles', 'manage', 'Manage roles and permissions'),
    ('manage_branches', 'branches', 'manage', 'Create, update, delete branches'),
    ('view_branches', 'branches', 'view', 'View branches'),
    ('manage_clients', 'clients', 'manage', 'Create, update, delete clients'),
    ('view_clients', 'clients', 'view', 'View clients'),
    ('manage_messages', 'messages', 'manage', 'Reply to messages and comments'),
    ('view_messages', 'messages', 'view', 'View messages and comments'),
    ('manage_integrations', 'integrations', 'manage', 'Configure platform integrations'),
    ('view_analytics', 'analytics', 'view', 'View analytics and reports'),
    ('send_sms', 'sms', 'send', 'Send SMS to clients'),
    ('manage_kanban', 'kanban', 'manage', 'Configure kanban statuses'),
    ('update_client_status', 'clients', 'update_status', 'Move clients in kanban');

-- Role Permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT '11111111-1111-1111-1111-111111111111', id FROM permissions; -- super_admin gets all

INSERT INTO role_permissions (role_id, permission_id)
SELECT '22222222-2222-2222-2222-222222222222', id FROM permissions 
WHERE name IN ('manage_users', 'view_users', 'manage_branches', 'view_branches', 
               'manage_clients', 'view_clients', 'view_messages', 'view_analytics', 'manage_kanban'); -- admin

INSERT INTO role_permissions (role_id, permission_id)
SELECT '33333333-3333-3333-3333-333333333333', id FROM permissions 
WHERE name IN ('view_clients', 'manage_clients', 'manage_messages', 'view_messages', 
               'update_client_status', 'send_sms'); -- community_manager

INSERT INTO role_permissions (role_id, permission_id)
SELECT '44444444-4444-4444-4444-444444444444', id FROM permissions 
WHERE name IN ('view_clients', 'view_messages', 'update_client_status', 'send_sms'); -- branch_admin

INSERT INTO role_permissions (role_id, permission_id)
SELECT '55555555-5555-5555-5555-555555555555', id FROM permissions 
WHERE name IN ('view_clients', 'view_messages', 'view_analytics', 'view_branches'); -- observer

-- Default Kanban Statuses
INSERT INTO kanban_statuses (name, slug, color, position) VALUES
    ('New', 'new', '#3F3091', 1),
    ('Contacted', 'contacted', '#F07E22', 2),
    ('Assigned to Branch', 'assigned_to_branch', '#4CAF50', 3),
    ('Waiting', 'waiting', '#FFC107', 4),
    ('Visited', 'visited', '#2196F3', 5),
    ('Closed', 'closed', '#8BC34A', 6),
    ('Lost', 'lost', '#F44336', 7);

-- Sample Branches (for testing)
INSERT INTO branches (name, address, phone, working_hours, region) VALUES
    ('Acoustic Tashkent Center', 'улица Amir Temur, 129, Tashkent', '+998 71 200 00 00', 
     '{"monday": "09:00-18:00", "tuesday": "09:00-18:00", "wednesday": "09:00-18:00", "thursday": "09:00-18:00", "friday": "09:00-18:00", "saturday": "09:00-14:00"}', 
     'Tashkent'),
    ('Acoustic Samarkand', 'Регистан площадь, Samarkand', '+998 66 233 00 00',
     '{"monday": "09:00-18:00", "tuesday": "09:00-18:00", "wednesday": "09:00-18:00", "thursday": "09:00-18:00", "friday": "09:00-18:00", "saturday": "09:00-14:00"}',
     'Samarkand'),
    ('Acoustic Bukhara', 'улица Бахоуддина Накшбанди, Bukhara', '+998 65 224 00 00',
     '{"monday": "09:00-18:00", "tuesday": "09:00-18:00", "wednesday": "09:00-18:00", "thursday": "09:00-18:00", "friday": "09:00-18:00", "saturday": "09:00-14:00"}',
     'Bukhara');

-- Default admin user (password: Admin123!)
INSERT INTO users (email, password_hash, first_name, last_name, role_id, branch_id) VALUES
    ('admin@acoustic.uz', '$2b$10$RwQ0s0YCEaCjKKxN2Q2xJuwD/DKSpFCA43hRtWsemefMh31sxV9Fe', 
     'System', 'Administrator', '11111111-1111-1111-1111-111111111111', 
     (SELECT id FROM branches LIMIT 1));
