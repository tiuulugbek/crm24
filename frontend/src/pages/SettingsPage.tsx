import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Settings, User, Lock, Bell } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../lib/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'notifications'>('profile');
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: { firstName: string; lastName: string; phone?: string }) =>
      authApi.updateProfile(data),
    onSuccess: (res: any) => {
      const u = res.data ?? res;
      if (u) setUser({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        branch: u.branch,
        permissions: u.permissions || (user?.permissions ?? []),
      });
      toast.success('Profil saqlandi');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Xato'),
  });

  const changePasswordMutation = useMutation({
    mutationFn: () =>
      authApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword),
    onSuccess: () => {
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Parol yangilandi');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Xato'),
  });

  React.useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
      });
    }
  }, [user?.id]);

  const tabs = [
    { id: 'profile' as const, label: 'Profil', icon: User },
    { id: 'password' as const, label: 'Parol', icon: Lock },
    { id: 'notifications' as const, label: 'Bildirishnomalar', icon: Bell },
  ];

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      firstName: profileForm.firstName,
      lastName: profileForm.lastName,
      phone: profileForm.phone || undefined,
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Yangi parollar mos kelmadi');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Yangi parol kamida 6 belgidan iborat bo‘lishi kerak');
      return;
    }
    changePasswordMutation.mutate();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
        <Settings className="w-7 h-7 text-primary" />
        Sozlamalar
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Profil va tizim sozlamalari</p>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-56 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === id
                    ? 'bg-primary text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          {activeTab === 'profile' && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profil ma’lumotlari</h2>
              <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ism</label>
                  <input
                    type="text"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm((f) => ({ ...f, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Familiya</label>
                  <input
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm((f) => ({ ...f, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <p className="text-gray-900 dark:text-white py-2">{user?.email}</p>
                  <p className="text-xs text-gray-500">Email o‘zgartirilmaydi</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefon</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="+998..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rol</label>
                  <p className="text-gray-900 dark:text-white py-1">{user?.role?.name || '—'}</p>
                </div>
                {user?.branch && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filial</label>
                    <p className="text-gray-900 dark:text-white py-1">{user.branch.name}</p>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  {updateProfileMutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </form>
            </>
          )}

          {activeTab === 'password' && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Parolni o‘zgartirish</h2>
              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Joriy parol</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Yangi parol</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Yangi parol (takror)</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  {changePasswordMutation.isPending ? 'Yangilanmoqda...' : 'Parolni yangilash'}
                </button>
              </form>
            </>
          )}

          {activeTab === 'notifications' && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bildirishnomalar</h2>
              <div className="space-y-3 max-w-md">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-primary" defaultChecked />
                  <span className="text-gray-700 dark:text-gray-300">Email orqali bildirishnomalar</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-primary" />
                  <span className="text-gray-700 dark:text-gray-300">Yangi xabarlar haqida xabar</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-primary" defaultChecked />
                  <span className="text-gray-700 dark:text-gray-300">Mijoz statusi o‘zgarganda</span>
                </label>
                <p className="text-sm text-gray-500 pt-2">Bildirishnomalar sozlamalari keyingi yangilanishda qo‘shiladi.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
