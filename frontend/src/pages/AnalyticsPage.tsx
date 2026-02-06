import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Users, MessageSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { analyticsApi } from '../lib/api';
import { clientsApi } from '../lib/api';

const COLORS = ['#F07E22', '#3F3091', '#10B981', '#F59E0B', '#EF4444'];

export default function AnalyticsPage() {
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsApi.getAll().then((r) => r.data),
  });

  const { data: dashboard } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: () => analyticsApi.getDashboard().then((r) => r.data),
    retry: false,
  });

  const bySource = (clients as any[]).reduce((acc: Record<string, number>, c: any) => {
    const s = c.source || 'boshqa';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(bySource).map(([name, value]) => ({ name, value }));

  const byStatus = (clients as any[]).reduce((acc: Record<string, number>, c: any) => {
    acc[c.status || 'new'] = (acc[c.status || 'new'] || 0) + 1;
    return acc;
  }, {});
  const barData = Object.entries(byStatus).map(([name, value]) => ({ name, soni: value }));

  const stats = [
    { label: 'Jami mijozlar', value: clients.length, icon: Users, color: 'bg-primary' },
    { label: 'Suhbatlar', value: dashboard?.totalConversations ?? 0, icon: MessageSquare, color: 'bg-secondary' },
    { label: 'Aktiv kanallar', value: dashboard?.activeIntegrations ?? 3, icon: BarChart3, color: 'bg-green-500' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
        <BarChart3 className="w-7 h-7 text-primary" />
        Analytics
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Statistika va hisobotlar</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Mijozlar manbasi bo‘yicha</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(e) => `${e.name}: ${e.value}`}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">Ma’lumot yo‘q</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Status bo‘yicha</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-600" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="soni" fill="#F07E22" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">Ma’lumot yo‘q</p>
          )}
        </div>
      </div>
    </div>
  );
}
