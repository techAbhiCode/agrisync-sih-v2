import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, CheckCheck, Trash2, AlertTriangle,
  CheckCircle2, Info, XCircle, X,
} from 'lucide-react';
import { useNotificationStore } from '@/store/notificationStore';
import type { NotifType } from '@/store/notificationStore';

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

const typeConfig: Record<NotifType, { icon: React.ReactNode; color: string; bg: string }> = {
  success: {
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    color: 'text-lime-400',
    bg: 'bg-lime-500/10 border-lime-500/20',
  },
  warning: {
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
  },
  info: {
    icon: <Info className="h-3.5 w-3.5" />,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10 border-sky-500/20',
  },
  error: {
    icon: <XCircle className="h-3.5 w-3.5" />,
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
  },
};

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { notifications, markRead, markAllRead, clearAll } = useNotificationStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close on outside click
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Trigger */}
      <button
        id="notif-bell"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-full hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full px-1"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute right-0 top-12 w-80 sm:w-[360px] z-[200] bg-zinc-900/95 backdrop-blur-2xl border border-zinc-800 rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.9)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-zinc-100">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-lime-500/15 text-lime-400 border border-lime-500/20 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={markAllRead}
                  title="Mark all read"
                  className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <CheckCheck className="h-4 w-4" />
                </button>
                <button
                  onClick={clearAll}
                  title="Clear all"
                  className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[340px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <div className="p-3 bg-zinc-800/50 rounded-full">
                    <Bell className="h-6 w-6 text-zinc-600" />
                  </div>
                  <p className="text-zinc-500 text-sm">You're all caught up!</p>
                </div>
              ) : (
                <motion.ul layout>
                  {notifications.map((notif) => {
                    const cfg = typeConfig[notif.type];
                    return (
                      <motion.li
                        key={notif._id}
                        layout
                        onClick={() => markRead(notif._id)}
                        className={`flex gap-3 px-4 py-3.5 border-b border-zinc-800/50 cursor-pointer transition-colors hover:bg-zinc-800/40 ${
                          !notif.read ? 'bg-zinc-800/20' : ''
                        }`}
                      >
                        <div
                          className={`mt-0.5 p-1.5 rounded-lg border flex-shrink-0 ${cfg.bg} ${cfg.color}`}
                        >
                          {cfg.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={`text-sm font-semibold leading-snug ${
                                !notif.read ? 'text-zinc-100' : 'text-zinc-400'
                              }`}
                            >
                              {notif.title}
                            </p>
                            <span className="text-[10px] text-zinc-600 flex-shrink-0 mt-0.5">
                              {timeAgo(notif.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                            {notif.message}
                          </p>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-lime-500 flex-shrink-0 mt-2" />
                        )}
                      </motion.li>
                    );
                  })}
                </motion.ul>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-zinc-800 text-center">
              <button className="text-xs text-zinc-500 hover:text-lime-400 transition-colors font-medium">
                View all activity →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
