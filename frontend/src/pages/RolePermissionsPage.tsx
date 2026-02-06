import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Save, Loader2 } from 'lucide-react';
import { rolePermissionsApi } from '../lib/api';
import { getPermissionLabel, getResourceLabel } from '../lib/permissionLabels';
import toast from 'react-hot-toast';

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super admin',
  admin: 'Admin',
  call_center: 'Call center',
  community_manager: 'Call center',
};

export default function RolePermissionsPage() {
  const queryClient = useQueryClient();
  const [dirty, setDirty] = useState<Record<string, string[]>>({});

  const { data: permissions = [], isLoading: loadingPerms } = useQuery({
    queryKey: ['role-permissions-list'],
    queryFn: () => rolePermissionsApi.getPermissions().then((r) => r.data),
  });

  const { data: rolesWithPerms = [], isLoading: loadingRoles } = useQuery({
    queryKey: ['roles-with-permissions'],
    queryFn: () => rolePermissionsApi.getRolesWithPermissions().then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) =>
      rolePermissionsApi.setRolePermissions(roleId, permissionIds),
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: ['roles-with-permissions'] });
      setDirty((d) => ({ ...d, [roleId]: undefined }));
      toast.success('Ruxsatlar saqlandi');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Xato'),
  });

  const permissionsByResource = useMemo(() => {
    const map: Record<string, { id: string; name: string; action: string; description: string | null }[]> = {};
    for (const p of permissions) {
      if (!map[p.resource]) map[p.resource] = [];
      map[p.resource].push({ id: p.id, name: p.name, action: p.action, description: p.description });
    }
    return map;
  }, [permissions]);

  const getCurrentPermissionIds = (role: { id: string; name: string; permissionIds: string[] }) =>
    dirty[role.id] !== undefined ? dirty[role.id] : role.permissionIds;

  const setPermissionIds = (roleId: string, permissionIds: string[]) =>
    setDirty((d) => ({ ...d, [roleId]: permissionIds }));

  const togglePermission = (roleId: string, permissionId: string, current: string[]) => {
    const next = current.includes(permissionId)
      ? current.filter((id) => id !== permissionId)
      : [...current, permissionId];
    setPermissionIds(roleId, next);
  };

  const isDirty = (role: { id: string; permissionIds: string[] }) => {
    const current = getCurrentPermissionIds(role);
    const orig = role.permissionIds;
    if (current.length !== orig.length) return true;
    const set = new Set(orig);
    return current.some((id) => !set.has(id));
  };

  if (loadingPerms || loadingRoles) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const editableRoles = rolesWithPerms.filter((r) => r.name !== 'super_admin');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Shield className="w-7 h-7 text-primary" />
          Rollar va ruxsatlar
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Har bir rol uchun qaysi bo‘limlar (Inbox, Mijozlar, Mijozlar oqimi, Analytics, Foydalanuvchilar va b.) ko‘rinishini belgilang.
        </p>
      </div>

      <div className="space-y-6">
        {editableRoles.map((role) => {
          const currentIds = getCurrentPermissionIds(role);
          const roleLabel = ROLE_LABELS[role.name] || role.name;

          return (
            <div
              key={role.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 dark:text-white">{roleLabel}</h2>
                {isDirty(role) && (
                  <button
                    type="button"
                    onClick={() =>
                      saveMutation.mutate({ roleId: role.id, permissionIds: getCurrentPermissionIds(role) })
                    }
                    disabled={saveMutation.isPending}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50 text-sm"
                  >
                    {saveMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Saqlash
                  </button>
                )}
              </div>
              <div className="p-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(permissionsByResource).map(([resource, perms]) => (
                    <div key={resource} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {getResourceLabel(resource)}
                      </div>
                      <div className="space-y-2">
                        {perms.map((p) => (
                          <label
                            key={p.id}
                            className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 dark:text-gray-400"
                          >
                            <input
                              type="checkbox"
                              checked={currentIds.includes(p.id)}
                              onChange={() => togglePermission(role.id, p.id, currentIds)}
                              className="rounded border-gray-300 text-primary"
                            />
                            <span>{getPermissionLabel(p.name)}</span>
                            {p.description && (
                              <span className="text-xs text-gray-400" title={p.description}>?</span>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editableRoles.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">Boshqariladigan rollar topilmadi.</p>
      )}
    </div>
  );
}
