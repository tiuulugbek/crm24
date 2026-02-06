import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Search, Phone, Mail, Edit2, Trash2 } from 'lucide-react';
import { clientsApi } from '../lib/api';
import toast from 'react-hot-toast';

const STATUS_LABELS: Record<string, string> = {
  new: 'Yangi',
  contacted: "Bog'langan",
  assigned: 'Tayinlangan',
  waiting: 'Kutilmoqda',
  visited: 'Tashrif',
  closed: 'Yopilgan',
  lost: "Yo'qotilgan",
};

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [form, setForm] = useState({ name: '', phoneNumber: '', email: '', source: 'manual', notes: '' });

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients', search, statusFilter],
    queryFn: () => clientsApi.getAll({ search: search || undefined, status: statusFilter || undefined }).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => clientsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Mijoz qo‘shildi');
      setModalOpen(false);
      resetForm();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Xato'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => clientsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Saqlandi');
      setEditingClient(null);
      resetForm();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Xato'),
  });

  const resetForm = () => {
    setForm({ name: '', phoneNumber: '', email: '', source: 'manual', notes: '' });
  };

  const openAdd = () => {
    setEditingClient(null);
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (client: any) => {
    setEditingClient(client);
    setForm({
      name: client.name || '',
      phoneNumber: client.phoneNumber || '',
      email: client.email || '',
      source: client.source || 'manual',
      notes: client.notes || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      updateMutation.mutate({ id: editingClient.id, data: form });
    } else {
      createMutation.mutate({ ...form, status: 'new' });
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-primary" />
            Mijozlar
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Ro‘yxat va boshqaruv</p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-primary text-white rounded-lg hover:opacity-90 min-h-[44px] touch-manipulation"
        >
          <Plus className="w-4 h-4" />
          Mijoz qo‘shish
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Qidirish (ism, telefon)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="">Barcha statuslar</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Yuklanmoqda...</div>
        ) : clients.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Mijozlar topilmadi</div>
        ) : (
          <>
            {/* Mobil: kartochkalar */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {clients.map((client: any) => (
                <div
                  key={client.id}
                  className="p-4 active:bg-gray-50 dark:active:bg-gray-700/30 flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{client.name || '—'}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{client.phoneNumber || '—'}</span>
                    </p>
                    <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      {STATUS_LABELS[client.status] || client.status}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => openEdit(client)}
                    className="flex-shrink-0 p-3 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    aria-label="Tahrirlash"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            {/* Desktop: jadval */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Ism</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Telefon</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Manba</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                    <th className="w-24 py-3 px-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {clients.map((client: any) => (
                    <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{client.name || '—'}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{client.phoneNumber || '—'}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{client.email || '—'}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{client.source || '—'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700">
                          {STATUS_LABELS[client.status] || client.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => openEdit(client)}
                          className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded min-h-[44px] min-w-[44px] flex items-center justify-center"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setModalOpen(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingClient ? 'Mijozni tahrirlash' : 'Yangi mijoz'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ism</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefon</label>
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Manba</label>
                <select
                  value={form.source}
                  onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="manual">Qo‘lda</option>
                  <option value="telegram">Telegram</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                  <option value="facebook">Facebook</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Izoh</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50">
                  {createMutation.isPending || updateMutation.isPending ? '...' : editingClient ? 'Saqlash' : 'Qo‘shish'}
                </button>
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg">
                  Bekor qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
