import { create } from 'zustand';
import { getNotifications, markNotificationRead, markAllNotificationsRead, clearAllNotifications } from '@/lib/api';

export type NotifType = 'success' | 'warning' | 'info' | 'error';

export interface Notification {
  _id: string; // From MongoDB
  type: NotifType;
  title: string;
  message: string;
  createdAt: string; // From MongoDB
  read: boolean;
}

// Map MongoDB _id to frontend if needed, but we'll just use _id
interface NotificationState {
  notifications: Notification[];
  fetchNotifications: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  clearAll: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],
  
  fetchNotifications: async () => {
    try {
      const data = await getNotifications();
      if (data && data.success) {
        set({ notifications: data.notifications });
      }
    } catch (error) {
      console.error("Failed to fetch notifications in store", error);
    }
  },

  markRead: async (id) => {
    try {
      await markNotificationRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, read: true } : n
        ),
      }));
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  },

  markAllRead: async () => {
    try {
      await markAllNotificationsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      }));
    } catch (error) {
      console.error("Failed to mark all notifications as read", error);
    }
  },

  clearAll: async () => {
    try {
      await clearAllNotifications();
      set({ notifications: [] });
    } catch (error) {
      console.error("Failed to clear notifications", error);
    }
  },
}));
