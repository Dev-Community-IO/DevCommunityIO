import { useState, useRef, useEffect } from 'react';
import { Bell, Check, MessageCircle, Heart, AtSign, UserPlus, FileText, Award, Settings, Bookmark, Smile, Share2, Users, ShieldCheck, Loader } from 'lucide-react';
import { Notification as AppNotification, NotificationType } from '../types';
import { Avatar } from './Avatar';
import notificationsService, { Notification } from '../services/api/notifications.service';
import { useAuth } from '../contexts/AuthContext';

interface NotificationDropdownProps {
  onViewAll: () => void;
}

// Map API notification to app notification format
const mapApiNotification = (apiNotif: Notification): AppNotification => {
  return {
    id: apiNotif.id,
    type: apiNotif.type as NotificationType,
    title: apiNotif.title,
    message: apiNotif.message,
    timestamp: new Date(apiNotif.createdAt),
    isRead: apiNotif.isRead,
    user: apiNotif.relatedUser ? {
      id: apiNotif.relatedUser.id,
      username: apiNotif.relatedUser.username,
      avatar: apiNotif.relatedUser.avatar_url || undefined,
      walletAddress: '',
      reputation: 0,
    } : undefined,
    post: apiNotif.relatedPost ? {
      id: apiNotif.relatedPost.id,
      title: apiNotif.relatedPost.title,
    } : undefined,
    actionUrl: apiNotif.actionUrl,
  };
};

const getNotificationIcon = (type: NotificationType | string) => {
  switch (type) {
    case 'comment':
    case 'reply':
      return MessageCircle;
    case 'upvote':
      return Heart;
    case 'mention':
      return AtSign;
    case 'follow':
      return UserPlus;
    case 'post':
      return FileText;
    case 'achievement':
      return Award;
    case 'bookmark':
      return Bookmark;
    case 'reaction':
      return Smile;
    case 'share':
      return Share2;
    case 'page_invite':
      return Users;
    case 'verification':
      return ShieldCheck;
    case 'system':
      return Settings;
    default:
      return Bell;
  }
};

const getNotificationColor = (type: NotificationType | string) => {
  switch (type) {
    case 'comment':
    case 'reply':
      return 'from-blue-500 to-blue-600';
    case 'upvote':
      return 'from-red-500 to-pink-600';
    case 'mention':
      return 'from-purple-500 to-purple-600';
    case 'follow':
      return 'from-green-500 to-emerald-600';
    case 'post':
      return 'from-cyan-500 to-blue-600';
    case 'achievement':
      return 'from-yellow-500 to-orange-600';
    case 'bookmark':
      return 'from-amber-500 to-yellow-600';
    case 'reaction':
      return 'from-pink-500 to-rose-600';
    case 'share':
      return 'from-indigo-500 to-blue-600';
    case 'page_invite':
      return 'from-teal-500 to-cyan-600';
    case 'verification':
      return 'from-emerald-500 to-green-600';
    case 'system':
      return 'from-gray-500 to-gray-600';
    default:
      return 'from-gray-500 to-gray-600';
  }
};

const formatTimestamp = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

export function NotificationDropdown({ onViewAll }: NotificationDropdownProps) {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isOpen, isAuthenticated]);

  // Poll for unread count every 30 seconds when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
      if (isOpen) {
        fetchNotifications();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const recent = await notificationsService.getRecent(6);
      setNotifications(recent.map(mapApiNotification));
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationsService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await notificationsService.markAsRead(id);
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
      >
        <Bell size={20} className="text-gray-700 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[380px] sm:w-[420px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-fade-in">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-800">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              >
                <Check size={14} />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Bell size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">No notifications yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  We'll notify you when something arrives
                </p>
              </div>
            ) : (
              notifications.slice(0, 6).map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const colorClass = getNotificationColor(notification.type);

                return (
                  <a
                    key={notification.id}
                    href={notification.actionUrl || '#'}
                    onClick={(e) => {
                      if (notification.actionUrl?.startsWith('/')) {
                        e.preventDefault();
                        window.location.href = notification.actionUrl;
                      }
                      if (!notification.isRead) {
                        handleMarkAsRead(notification.id, e);
                      }
                    }}
                    className={`relative p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer border-b border-gray-100 dark:border-gray-800 block ${
                      !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    {!notification.isRead && (
                      <div className="absolute top-4 right-4">
                        <button
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                          title="Mark as read"
                        >
                          <Check size={14} className="text-blue-600 dark:text-blue-400" />
                        </button>
                      </div>
                    )}

                    <div className="flex gap-3">
                      {notification.user ? (
                        <Avatar
                          src={notification.user.avatar}
                          alt={notification.user.username}
                          size="sm"
                          className="flex-shrink-0"
                        />
                      ) : (
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center flex-shrink-0`}>
                          <Icon size={18} className="text-white" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {notification.title}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 flex items-center gap-2">
                          {formatTimestamp(notification.timestamp)}
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </p>
                      </div>
                    </div>
                  </a>
                );
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onViewAll();
                }}
                className="w-full py-2.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
