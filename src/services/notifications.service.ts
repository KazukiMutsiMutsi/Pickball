import { apiRequest } from '@/src/api/client';
import { ENDPOINTS } from '@/src/api/endpoints';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  booking_id?: string;
  created_at: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export const notificationsService = {
  async getAll(token: string): Promise<NotificationsResponse> {
    return apiRequest<NotificationsResponse>(ENDPOINTS.notifications.list, { token });
  },

  async markRead(id: string, token: string): Promise<void> {
    await apiRequest(ENDPOINTS.notifications.markRead(id), { method: 'PATCH', token });
  },

  async markAllRead(token: string): Promise<void> {
    await apiRequest(ENDPOINTS.notifications.readAll, { method: 'PATCH', token });
  },
};
