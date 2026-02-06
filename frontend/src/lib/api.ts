import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (data: any) =>
    api.post('/auth/register', data),
  
  getProfile: () =>
    api.get('/auth/me'),
  
  updateProfile: (data: { firstName?: string; lastName?: string; phone?: string }) =>
    api.patch('/auth/profile', data),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
};

// Clients API
export const clientsApi = {
  getAll: (filters?: any) =>
    api.get('/clients', { params: filters }),
  
  getOne: (id: string) =>
    api.get(`/clients/${id}`),
  
  create: (data: any) =>
    api.post('/clients', data),
  
  update: (id: string, data: any) =>
    api.put(`/clients/${id}`, data),
  
  updateStatus: (id: string, status: string) =>
    api.put(`/clients/${id}/status`, { status }),
  
  merge: (primaryId: string, secondaryId: string) =>
    api.post('/clients/merge', { primaryClientId: primaryId, secondaryClientId: secondaryId }),
  
  getStatusHistory: (id: string) =>
    api.get(`/clients/${id}/status-history`),
};

// Messages API
export const messagesApi = {
  getConversations: () =>
    api.get('/messages/conversations'),
  
  getMessages: (conversationId: string) =>
    api.get(`/messages/conversations/${conversationId}/messages`),
  
  sendMessage: (conversationId: string, content: string) =>
    api.post('/messages/send', { conversationId, content }),
  
  markAsRead: (conversationId: string) =>
    api.put(`/messages/conversations/${conversationId}/read`),
};

// Comments API
export const commentsApi = {
  getAll: (filters?: any) =>
    api.get('/comments', { params: filters }),
  
  reply: (commentId: string, content: string) =>
    api.post(`/comments/${commentId}/reply`, { content }),
  
  markAsRead: (commentId: string) =>
    api.put(`/comments/${commentId}/read`),
};

// SMS API
export const smsApi = {
  send: (data: { clientId: string; branchId: string; phoneNumber: string }) =>
    api.post('/sms/send', data),
  
  getHistory: (filters?: any) =>
    api.get('/sms/history', { params: filters }),
};

// Analytics API
export const analyticsApi = {
  getDashboard: () =>
    api.get('/analytics/dashboard'),
  
  getLeadsByPlatform: (startDate: string, endDate: string) =>
    api.get('/analytics/leads-by-platform', { params: { startDate, endDate } }),
  
  getBranchPerformance: (startDate: string, endDate: string) =>
    api.get('/analytics/branch-performance', { params: { startDate, endDate } }),
  
  getConversionFunnel: (startDate: string, endDate: string) =>
    api.get('/analytics/conversion-funnel', { params: { startDate, endDate } }),
};

// Branches API
export const branchesApi = {
  getAll: () =>
    api.get('/branches'),
  
  getOne: (id: string) =>
    api.get(`/branches/${id}`),
  
  create: (data: any) =>
    api.post('/branches', data),
  
  update: (id: string, data: any) =>
    api.put(`/branches/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/branches/${id}`),
};

// Users API
export const usersApi = {
  getAll: () =>
    api.get('/users'),
  
  getRoles: () =>
    api.get('/users/roles'),
  
  getOne: (id: string) =>
    api.get(`/users/${id}`),
  
  create: (data: any) =>
    api.post('/users', data),
  
  update: (id: string, data: any) =>
    api.put(`/users/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/users/${id}`),
};

// Role permissions (faqat super_admin) — qaysi rolga qaysi ruxsatlar
export const rolePermissionsApi = {
  getPermissions: () =>
    api.get<{ id: string; name: string; resource: string; action: string; description: string | null }[]>('/users/roles/permissions'),
  
  getRolesWithPermissions: () =>
    api.get<{ id: string; name: string; description: string | null; permissionIds: string[] }[]>('/users/roles/with-permissions'),
  
  setRolePermissions: (roleId: string, permissionIds: string[]) =>
    api.put(`/users/roles/${roleId}/permissions`, { permissionIds }),
};

// Integrations API (har bir platformada bir nechta ulanish: botlar, profillar)
export const integrationsApi = {
  getAll: () =>
    api.get('/integrations'),
  
  configure: (platform: string, payload: { name?: string; config?: Record<string, any> }, termsAcceptedAt?: string) =>
    api.post('/integrations/configure', { platform, name: payload?.name, config: payload?.config || {}, termsAcceptedAt }),
  
  toggle: (id: string, isActive: boolean) =>
    api.put(`/integrations/${id}/toggle`, { isActive }),
  
  delete: (id: string) =>
    api.delete(`/integrations/${id}`),
};

// Kanban API
export const kanbanApi = {
  getStatuses: () =>
    api.get('/kanban/statuses'),
  
  createStatus: (data: any) =>
    api.post('/kanban/statuses', data),
  
  updateStatus: (id: string, data: any) =>
    api.put(`/kanban/statuses/${id}`, data),
  
  deleteStatus: (id: string) =>
    api.delete(`/kanban/statuses/${id}`),
  
  reorderStatuses: (statusIds: string[]) =>
    api.put('/kanban/statuses/reorder', { statusIds }),
};
