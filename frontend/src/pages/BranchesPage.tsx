import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Plus, Edit2, Phone } from 'lucide-react';
import { branchesApi } from '../lib/api';
import toast from 'react-hot-toast';

const MOCK_BRANCHES = [
  { id: '1', name: 'Acoustic Toshkent', address: 'Amir Temur ko‘chasi, 129', phone: '+998 71 200 00 00', region: 'Toshkent', isActive: true },
  { id: '2', name: 'Acoustic Samarqand', address: 'Registon maydoni', phone: '+998 66 233 00 00', region: 'Samarqand', isActive: true },
  { id: '3', name: 'Acoustic Buxoro', address: 'Bahouddin Naqshbandiy', phone: '+998 65 224 00 00', region: 'Buxoro', isActive: true },
];

const emptyForm = { name: '', address: '', phone: '', region: '', smsTemplate: '' };

export default function BranchesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: branchesData, isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchesApi.getAll().then((r) => r.data),
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => branchesApi.create({ ...data, workingHours: {}, smsTemplate: data.smsTemplate || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast.success('Filial qo‘shildi');
      setModalOpen(false);
      setForm(emptyForm);
      setEditingBranch(null);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Xato'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      branchesApi.update(id, { ...data, smsTemplate: data.smsTemplate || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast.success('Saqlandi');
      setModalOpen(false);
      setForm(emptyForm);
      setEditingBranch(null);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Xato'),
  });

  const branches = Array.isArray(branchesData) ? branchesData : MOCK_BRANCHES;

  const openAdd = () => {
    setEditingBranch(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (branch: any) => {
    setEditingBranch(branch);
    setForm({
      name: branch.name || '',
      address: branch.address || '',
      phone: branch.phone || '',
      region: branch.region || '',
      smsTemplate: branch.smsTemplate ?? '',
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBranch) {
      updateMutation.mutate({ id: editingBranch.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-7 h-7 text-primary" />
            Filiallar
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Filiallar ro‘yxati va manzillar</p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Filial qo‘shish
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-gray-500">Yuklanmoqda...</div>
        ) : (
          branches.map((branch: any) => (
            <div
              key={branch.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{branch.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    {branch.address}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 flex items-center gap-1">
                    <Phone className="w-3 h-3 flex-shrink-0" />
                    {branch.phone}
                  </p>
                  {branch.region && (
                    <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                      {branch.region}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => openEdit(branch)}
                  className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  title="Tahrirlash"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => { setModalOpen(false); setEditingBranch(null); }}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingBranch ? 'Filialni tahrirlash' : 'Yangi filial'}
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomi</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Manzil</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefon</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hudud</label>
                <input
                  type="text"
                  value={form.region}
                  onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SMS shabloni (ixtiyoriy)</label>
                <textarea
                  value={form.smsTemplate}
                  onChange={(e) => setForm((f) => ({ ...f, smsTemplate: e.target.value }))}
                  placeholder={'Assalomu alaykum {{client_name}}!\n📍 {{branch_name}}\n{{branch_address}}\n📞 {{branch_phone}}\n⏰ {{working_hours}}'}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                />
                <p className="text-xs text-gray-500 mt-1">Placeholderlar: {"{{client_name}}"}, {"{{branch_name}}"}, {"{{branch_address}}"}, {"{{branch_phone}}"}, {"{{working_hours}}"}. Bo‘sh qoldirsangiz default matn yuboriladi.</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 py-2 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? '...' : 'Saqlash'}
                </button>
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg">Bekor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
