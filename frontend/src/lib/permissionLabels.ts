/**
 * Ruxsatlar uchun frontend yozuvlari — koddagi name (masalan manage_kanban)
 * foydalanuvchiga ko‘rinadigan matn (Mijozlar oqimi sozlamalari) ga map qiladi.
 * Hamma joyda shu mapping ishlatiladi.
 */

export const PERMISSION_LABELS: Record<string, string> = {
  manage_users: 'Foydalanuvchilarni boshqarish',
  view_users: 'Foydalanuvchilarni ko‘rish',
  manage_roles: 'Rollar va ruxsatlarni boshqarish',
  manage_branches: 'Filiallarni boshqarish',
  view_branches: 'Filiallarni ko‘rish',
  manage_clients: 'Mijozlarni boshqarish',
  view_clients: 'Mijozlarni ko‘rish',
  manage_messages: 'Xabarlarni boshqarish',
  view_messages: 'Xabarlarni ko‘rish',
  manage_integrations: 'Integratsiyalarni boshqarish',
  view_analytics: 'Analitikani ko‘rish',
  send_sms: 'SMS yuborish',
  manage_kanban: 'Mijozlar oqimi sozlamalari',
  update_client_status: 'Mijozlar oqimida siljitish',
};

/** Resurs (bo‘lim) nomlari — kartochka sarlavhalari uchun */
export const RESOURCE_LABELS: Record<string, string> = {
  analytics: 'Analitika',
  branches: 'Filiallar',
  clients: 'Mijozlar',
  integrations: 'Integratsiyalar',
  kanban: 'Mijozlar oqimi',
  messages: 'Xabarlar',
  roles: 'Rollar',
  sms: 'SMS',
  users: 'Foydalanuvchilar',
};

export function getPermissionLabel(permissionName: string): string {
  return PERMISSION_LABELS[permissionName] ?? permissionName;
}

export function getResourceLabel(resource: string): string {
  return RESOURCE_LABELS[resource] ?? resource;
}
