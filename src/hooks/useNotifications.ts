import { useAuthContext } from '@/src/context/AuthContext';
import { Notification, notificationsService } from '@/src/services/notifications.service';
import { useCallback, useEffect, useState } from 'react';

export function useNotifications() {
  const { user } = useAuthContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!user?.token) return;
    setLoading(true);
    notificationsService
      .getAll(user.token)
      .then(({ notifications: n, unreadCount: c }) => {
        setNotifications(n);
        setUnreadCount(c);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user?.token]);

  useEffect(refresh, [refresh]);

  const markRead = useCallback(async (id: string) => {
    if (!user?.token) return;
    await notificationsService.markRead(id, user.token);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, [user?.token]);

  const markAllRead = useCallback(async () => {
    if (!user?.token) return;
    await notificationsService.markAllRead(user.token);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, [user?.token]);

  return { notifications, unreadCount, loading, error, refresh, markRead, markAllRead };
}
