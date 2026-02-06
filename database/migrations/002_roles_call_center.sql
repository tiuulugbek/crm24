-- Call center roli (CRM asosan call center xodimlari uchun)
-- Super admin, Admin, Call center — 3 ta asosiy rol

INSERT INTO roles (id, name, description) VALUES
    ('66666666-6666-6666-6666-666666666666', 'call_center', 'Call center operatori: mijozlar, xabarlar, kanban, SMS')
ON CONFLICT (id) DO NOTHING;

-- Call center ruxsatlari: mijozlar, xabarlar, status o'zgartirish, SMS, analitika
INSERT INTO role_permissions (role_id, permission_id)
SELECT '66666666-6666-6666-6666-666666666666', id FROM permissions
WHERE name IN (
    'view_clients', 'manage_clients', 'view_messages', 'manage_messages',
    'update_client_status', 'send_sms', 'view_analytics'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;
