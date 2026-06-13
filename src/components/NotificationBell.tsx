import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { Notification } from '../types/task';

interface NotifResponse {
  notifications: Notification[];
  unread_count: number;
}

async function fetchNotifications(): Promise<NotifResponse> {
  const res = await api.get<NotifResponse>('/notifications?limit=20');
  return res.data;
}

function NotificationBell() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data } = useQuery<NotifResponse>({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 30_000,
  });

  const unreadCount = data?.unread_count ?? 0;
  const notifications = data?.notifications ?? [];

  async function handleMarkAllRead() {
    await api.patch('/notifications/read-all');
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }

  async function handleMarkRead(notifId: string) {
    await api.patch(`/notifications/${notifId}/read`);
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-white/80 hover:text-white hover:bg-white/10 px-2 py-1 rounded text-sm transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="mark-all-read">
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="notification-empty">No notifications</p>
          ) : (
            <ul className="notification-list">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`notification-item${n.read ? '' : ' unread'}`}
                  onClick={() => !n.read && handleMarkRead(n.id)}
                >
                  <p className="notification-body">{n.body}</p>
                  <span className="notification-time">
                    {new Date(n.created_at).toLocaleString('en-US', {
                      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                    })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
