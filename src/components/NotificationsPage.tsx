import { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Check, Trash2, Settings, Filter, MessageCircle, Heart, AtSign, UserPlus, FileText, Award, Loader } from 'lucide-react';
import { Notification, NotificationType } from '../types';
import { Avatar } from './Avatar';
import { Button } from './Button';
import notificationsService from '../services/api/notifications.service';

interface NotificationsPageProps {
  onBack: () => void;
}

const REMOVED_mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'comment',
    title: 'New Comment',
    message: 'John Doe commented on your post "Building Modern Web Apps with React and TypeScript"',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    isRead: false,
    user: {
      id: '1',
      username: 'johndoe',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      walletAddress: '0x1234',
      reputation: 150,
    },
    post: {
      id: '1',
      title: 'Building Modern Web Apps',
    },
  },
  {
    id: '2',
    type: 'upvote',
    title: 'Post Upvoted',
    message: 'Sarah Smith and 12 others upvoted your post',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    isRead: false,
    user: {
      id: '2',
      username: 'sarahsmith',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      walletAddress: '0x5678',
      reputation: 200,
    },
  },
  {
    id: '3',
    type: 'mention',
    title: 'You were mentioned',
    message: 'Alex Chen mentioned you in a comment: "@emma what do you think about this approach?"',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isRead: false,
    user: {
      id: '3',
      username: 'alexchen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      walletAddress: '0x9012',
      reputation: 180,
    },
  },
  {
    id: '4',
    type: 'follow',
    title: 'New Follower',
    message: 'Mike Johnson started following you',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    isRead: true,
    user: {
      id: '4',
      username: 'mikej',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
      walletAddress: '0x3456',
      reputation: 120,
    },
  },
  {
    id: '5',
    type: 'reply',
    title: 'New Reply',
    message: 'Emma Wilson replied to your comment',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    isRead: true,
    user: {
      id: '5',
      username: 'emmawilson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EmmaW',
      walletAddress: '0x7890',
      reputation: 160,
    },
  },
  {
    id: '6',
    type: 'achievement',
    title: 'Achievement Unlocked!',
    message: 'You earned the "Community Contributor" badge for posting 10+ helpful comments',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: '7',
    type: 'post',
    title: 'New Post from Following',
    message: 'David Lee published a new post: "Advanced TypeScript Patterns"',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isRead: true,
    user: {
      id: '6',
      username: 'davidlee',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
      walletAddress: '0x1111',
      reputation: 250,
    },
  },
  {
    id: '8',
    type: 'upvote',
    title: 'Comment Upvoted',
    message: 'Lisa Brown upvoted your comment',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    isRead: true,
    user: {
      id: '7',
      username: 'lisabrown',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
      walletAddress: '0x2222',
      reputation: 190,
    },
  },
];

const filterOptions: { id: string; label: string; type: NotificationType | 'all' }[] = [
  { id: 'all', label: 'All', type: 'all' },
  { id: 'comment', label: 'Comments', type: 'comment' },
  { id: 'upvote', label: 'Upvotes', type: 'upvote' },
  { id: 'mention', label: 'Mentions', type: 'mention' },
  { id: 'follow', label: 'Follows', type: 'follow' },
  { id: 'achievement', label: 'Achievements', type: 'achievement' },
];

const getNotificationIcon = (type: NotificationType) => {
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
    default:
      return Bell;
  }
};

const getNotificationColor = (type: NotificationType) => {
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
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export function NotificationsPage({ onBack }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeFilter, setActiveFilter] = useState<NotificationType | 'all'>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await notificationsService.getNotifications();
        setNotifications(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to load notifications');
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const filteredNotifications = notifications.filter(n => {
    const matchesFilter = activeFilter === 'all' || n.type === activeFilter;
    const matchesUnread = !showUnreadOnly || !n.isRead;
    return matchesFilter && matchesUnread;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      ));
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err: any) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationsService.deleteNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err: any) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <p className="text-gray-600 dark:text-gray-400">
                  You have <span className="font-semibold text-blue-600 dark:text-blue-400">{unreadCount}</span> unread notification{unreadCount > 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-2"
                >
                  <Check size={16} />
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleClearAll}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  <Trash2 size={16} />
                  Clear all
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-600 dark:text-gray-400" />
                <span className="font-semibold text-gray-900 dark:text-white">Filter by type</span>
              </div>
              <button
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  showUnreadOnly
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Unread only
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {filterOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => setActiveFilter(option.type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeFilter === option.type
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Bell size={40} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No notifications
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {showUnreadOnly
                    ? "You're all caught up! No unread notifications."
                    : "We'll notify you when something arrives"}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const colorClass = getNotificationColor(notification.type);

                return (
                  <div
                    key={notification.id}
                    className={`group p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all ${
                      !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    <div className="flex gap-4">
                      {notification.user ? (
                        <Avatar
                          src={notification.user.avatar}
                          alt={notification.user.username}
                          size="md"
                          className="flex-shrink-0"
                        />
                      ) : (
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center flex-shrink-0`}>
                          <Icon size={22} className="text-white" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-3 mt-3">
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                {formatTimestamp(notification.timestamp)}
                              </p>
                              {!notification.isRead && (
                                <span className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                  Unread
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.isRead && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                title="Mark as read"
                              >
                                <Check size={18} className="text-blue-600 dark:text-blue-400" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notification.id)}
                              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={18} className="text-red-600 dark:text-red-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {filteredNotifications.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Showing {filteredNotifications.length} of {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
