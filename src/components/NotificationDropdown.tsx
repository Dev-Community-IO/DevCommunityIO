import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Loader2, ArrowRight } from 'lucide-react';
import { Notification as AppNotification } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';
import { useNavigate } from 'react-router-dom';
import {
  mapApiNotification,
  navigateFromNotification,
  NotificationRow,
} from './notificationUi';
import { asideGhostBtnClass } from './postCardSurface';

interface NotificationDropdownProps {
  onViewAll: () => void;
}

export function NotificationDropdown({ onViewAll }: NotificationDropdownProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications: apiNotifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
  } = useRealtimeNotifications({
    pollInterval: 15000,
    autoFetch: isAuthenticated,
    limit: 6,
  });

  const notifications = apiNotifications.map(mapApiNotification);

  useEffect(() => {
    if (isOpen && isAuthenticated) refresh();
  }, [isOpen, isAuthenticated, refresh]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleNotificationClick = (notification: AppNotification, event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest('[role="link"]')) return;
    setIsOpen(false);
    navigateFromNotification(navigate, notification, markAsRead);
  };

  const handleUserClick = (username: string, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setIsOpen(false);
    navigate(`/profile/${username}`);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead().catch(console.error);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-zinc-100"
        aria-label="Notifications"
        aria-expanded={isOpen}
        type="button"
      >
        <Bell size={20} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 z-50 mt-2 w-[min(100vw-1.5rem,22rem)] animate-fade-in overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-lg dark:border-white/10 dark:bg-zinc-900 sm:w-[26rem]`}
          role="dialog"
          aria-label="Notifications"
        >
          <div className="flex items-center justify-between gap-2 border-b border-zinc-100 bg-zinc-50/80 px-3 py-2.5 dark:border-white/[0.06] dark:bg-zinc-800/50">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Notifications</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {loading
                  ? 'Updating…'
                  : unreadCount > 0
                    ? `${unreadCount} unread`
                    : 'All caught up'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-zinc-200/80 bg-zinc-50/90 px-2 py-1 text-[11px] font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300 dark:hover:bg-white/[0.08]"
              >
                <Check size={12} strokeWidth={2} aria-hidden />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[min(70vh,28rem)] overflow-y-auto divide-y divide-zinc-100 bg-white dark:divide-white/[0.06] dark:bg-zinc-900">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-14">
                <Loader2 className="h-5 w-5 animate-spin text-zinc-400" strokeWidth={2} />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-14 text-center">
                <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200/80 bg-zinc-50 text-zinc-400 dark:border-white/10 dark:bg-white/[0.04]">
                  <Bell size={20} strokeWidth={1.75} />
                </span>
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">No notifications yet</p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Activity on your posts and profile will show up here.
                </p>
              </div>
            ) : (
              notifications.slice(0, 6).map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  variant="dropdown"
                  onNavigate={(e) => handleNotificationClick(notification, e)}
                  onMarkRead={
                    !notification.isRead
                      ? (e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          markAsRead(notification.id).catch(console.error);
                        }
                      : undefined
                  }
                  onDelete={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    deleteNotification(notification.id).catch(console.error);
                  }}
                  onUserClick={handleUserClick}
                />
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-zinc-100 bg-zinc-50/80 p-2 dark:border-white/[0.06] dark:bg-zinc-800/50">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onViewAll();
                }}
                className={`${asideGhostBtnClass} gap-2`}
              >
                View all notifications
                <ArrowRight size={14} strokeWidth={2} aria-hidden />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
