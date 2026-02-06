import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DndContext, DragEndEvent, DragOverlay, closestCorners } from '@dnd-kit/core';
import { clientsApi, kanbanApi, branchesApi } from '../lib/api';
import KanbanColumn from '../components/KanbanColumn';
import ClientCard from '../components/ClientCard';
import toast from 'react-hot-toast';
import { MapPin, Phone, Mail, X, User, Edit2 } from 'lucide-react';

const DEFAULT_STATUSES = [
  { id: '1', name: 'Yangi', slug: 'new', color: '#6B7280', position: 0 },
  { id: '2', name: "Bog'langan", slug: 'contacted', color: '#3B82F6', position: 1 },
  { id: '3', name: 'Tayinlangan', slug: 'assigned', color: '#8B5CF6', position: 2 },
  { id: '4', name: 'Kutilmoqda', slug: 'waiting', color: '#F59E0B', position: 3 },
  { id: '5', name: 'Tashrif', slug: 'visited', color: '#10B981', position: 4 },
  { id: '6', name: 'Yopilgan', slug: 'closed', color: '#059669', position: 5 },
  { id: '7', name: "Yo'qotilgan", slug: 'lost', color: '#EF4444', position: 6 },
];

export default function KanbanPage() {
  const queryClient = useQueryClient();
  const [activeClient, setActiveClient] = useState<any>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [pendingMove, setPendingMove] = useState<{ clientId: string; newStatus: string; clientName?: string } | null>(null);
  const [moveNotes, setMoveNotes] = useState('');
  const [panelEditMode, setPanelEditMode] = useState(false);
  const [panelForm, setPanelForm] = useState({ name: '', phoneNumber: '', email: '', branchId: '', status: '', notes: '' });

  const { data: statusesData } = useQuery({
    queryKey: ['kanban-statuses'],
    queryFn: () => kanbanApi.getStatuses().then(res => res.data),
    retry: false,
  });

  const statuses = statusesData ?? DEFAULT_STATUSES;

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsApi.getAll().then(res => res.data),
  });

  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchesApi.getAll().then(res => res.data),
  });

  const updateStatusOnlyMutation = useMutation({
    mutationFn: ({ clientId, status }: { clientId: string; status: string }) =>
      clientsApi.updateStatus(clientId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Status yangilandi');
    },
    onError: () => toast.error('Xato'),
  });

  const updateStatusWithBranchMutation = useMutation({
    mutationFn: async ({ clientId, status, notes }: { clientId: string; status: string; notes?: string }) => {
      await clientsApi.updateStatus(clientId, status);
      if (notes !== undefined && notes !== '') await clientsApi.update(clientId, { notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Status va izoh saqlandi');
      setPendingMove(null);
      setMoveNotes('');
    },
    onError: () => toast.error('Xato'),
  });

  const updateClientMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => clientsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Mijoz ma’lumotlari saqlandi');
      setPanelEditMode(false);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Xato'),
  });

  const openPanelEdit = (client: any) => {
    setPanelForm({
      name: client.name || '',
      phoneNumber: client.phoneNumber || '',
      email: client.email || '',
      branchId: client.branchId || '',
      status: client.status || 'new',
      notes: client.notes || '',
    });
    setPanelEditMode(true);
  };

  const savePanelEdit = () => {
    if (!selectedClientId) return;
    updateClientMutation.mutate({
      id: selectedClientId,
      data: {
        name: panelForm.name || undefined,
        phoneNumber: panelForm.phoneNumber || undefined,
        email: panelForm.email || undefined,
        branchId: panelForm.branchId || undefined,
        status: panelForm.status || undefined,
        notes: panelForm.notes || undefined,
      },
    });
  };

  const handleDragStart = (event: any) => {
    const { active } = event;
    const client = clients?.find((c: any) => c.id === active.id);
    setActiveClient(client);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveClient(null);

    if (!over) return;

    const clientId = active.id as string;
    const newStatus = over.id as string;

    const client = clients?.find((c: any) => c.id === clientId);
    if (!client || client.status === newStatus) return;

    const isNewToContacted = client.status === 'new' && newStatus === 'contacted';

    if (isNewToContacted) {
      setPendingMove({ clientId, newStatus, clientName: client.name || 'Mijoz' });
      setMoveNotes(client.notes || '');
    } else {
      updateStatusOnlyMutation.mutate({ clientId, status: newStatus });
    }
  };

  const confirmMove = () => {
    if (!pendingMove) return;
    updateStatusWithBranchMutation.mutate({
      clientId: pendingMove.clientId,
      status: pendingMove.newStatus,
      notes: moveNotes.trim() || undefined,
    });
  };

  const getClientsByStatus = (status: string) => {
    return clients?.filter((c: any) => c.status === status) || [];
  };

  const selectedClient = selectedClientId ? (clients as any[])?.find((c: any) => c.id === selectedClientId) : null;

  if (!statuses || !clients) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mijozlar oqimi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Mijozlarni tortib boshqa ustunga qo‘ying. Yangi → Bog‘langan o‘tkazganda izoh kiritishingiz mumkin.
          </p>
        </div>

        <DndContext
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {statuses
              .sort((a: any, b: any) => a.position - b.position)
              .map((status: any) => (
                <KanbanColumn
                  key={status.slug}
                  status={status}
                  clients={getClientsByStatus(status.slug)}
                  onOpenClient={(id) => { setSelectedClientId(id); setPanelEditMode(false); }}
                />
              ))}
          </div>

          <DragOverlay>
            {activeClient ? <ClientCard client={activeClient} isDragging /> : null}
          </DragOverlay>
        </DndContext>

        {/* Faqat Yangi → Bog'langan o'tkazganda */}
        {pendingMove && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setPendingMove(null)}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Izoh</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                <strong>{pendingMove.clientName}</strong> — Yangi dan Bog‘langan ga o‘tkazyapmiz. Kerak bo‘lsa izoh yozing.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Izoh (ixtiyoriy)</label>
                <textarea
                  value={moveNotes}
                  onChange={(e) => setMoveNotes(e.target.value)}
                  placeholder="Mijoz haqida qisqacha..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={confirmMove}
                  disabled={updateStatusWithBranchMutation.isPending}
                  className="flex-1 py-2 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  {updateStatusWithBranchMutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
                <button
                  type="button"
                  onClick={() => setPendingMove(null)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
                >
                  Bekor qilish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mijoz kartochkasi to'liq (yon panel) */}
        {selectedClient && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={() => setSelectedClientId(null)}>
            <div
              className="w-full max-w-md bg-white dark:bg-gray-800 shadow-xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Mijoz ma’lumotlari</h2>
                <div className="flex items-center gap-1">
                  {!panelEditMode ? (
                    <button
                      type="button"
                      onClick={() => openPanelEdit(selectedClient)}
                      className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      title="Tahrirlash"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => { setSelectedClientId(null); setPanelEditMode(false); }}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-4">
                {panelEditMode ? (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Ism</label>
                      <input
                        type="text"
                        value={panelForm.name}
                        onChange={(e) => setPanelForm((f) => ({ ...f, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="Ism"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Telefon</label>
                      <input
                        type="tel"
                        value={panelForm.phoneNumber}
                        onChange={(e) => setPanelForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="+998..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Email</label>
                      <input
                        type="email"
                        value={panelForm.email}
                        onChange={(e) => setPanelForm((f) => ({ ...f, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Filial</label>
                      <select
                        value={panelForm.branchId}
                        onChange={(e) => setPanelForm((f) => ({ ...f, branchId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="">Tanlanmadi</option>
                        {(branches as any[]).map((b: any) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Status</label>
                      <select
                        value={panelForm.status}
                        onChange={(e) => setPanelForm((f) => ({ ...f, status: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        {(statuses as any[]).map((s: any) => (
                          <option key={s.slug} value={s.slug}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Izoh</label>
                      <textarea
                        value={panelForm.notes}
                        onChange={(e) => setPanelForm((f) => ({ ...f, notes: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                        placeholder="Izoh..."
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={savePanelEdit}
                        disabled={updateClientMutation.isPending}
                        className="flex-1 py-2 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                      >
                        {updateClientMutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPanelEditMode(false)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
                      >
                        Bekor qilish
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-lg">
                          {selectedClient.name || 'Ismsiz mijoz'}
                        </p>
                        {selectedClient.source && (
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                            {selectedClient.source}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Telefon</label>
                      <p className="flex items-center gap-2 text-gray-900 dark:text-white mt-0.5">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {selectedClient.phoneNumber || '—'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</label>
                      <p className="flex items-center gap-2 text-gray-900 dark:text-white mt-0.5">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {selectedClient.email || '—'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Filial</label>
                      <p className="flex items-center gap-2 text-gray-900 dark:text-white mt-0.5">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {selectedClient.branch?.name || 'Belgilanmagan'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</label>
                      <p className="mt-0.5 text-gray-900 dark:text-white">
                        {(statuses as any[]).find((s: any) => s.slug === selectedClient.status)?.name || selectedClient.status}
                      </p>
                    </div>
                    {selectedClient.notes != null && selectedClient.notes !== '' && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Izoh</label>
                        <p className="mt-0.5 text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">{selectedClient.notes}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
