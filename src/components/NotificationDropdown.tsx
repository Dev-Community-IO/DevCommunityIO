import { useState, useRef, useEffect } from 'react';
import { Bell, Check, MessageCircle, Heart, AtSign, UserPlus, FileText, Award, Settings, Bookmark, Smile, Share2, Users, ShieldCheck, Loader, X } from 'lucide-react';
import { Notification as AppNotification, NotificationType } from '../types';
import { Avatar } from './Avatar';
import notificationsService, { Notification } from '../services/api/notifications.service';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';
import { useNavigate } from 'react-router-dom';

interface NotificationDropdownProps {
  onViewAll: () => void;
}

// Helper function to parse notification message and extract username
const parseNotificationMessage = (message: string, username?: string): { username?: string; rest: string } => {
  if (!username) return { rest: message };
  
  // Check if username appears at the start of the message
  if (message.startsWith(username)) {
    return {
      username,
      rest: message.substring(username.length).trim()
    };
  }
  
  // Check if username appears elsewhere in the message
  const index = message.indexOf(username);
  if (index !== -1) {
    return {
      username,
      rest: message.substring(0, index).trim() + ' ' + message.substring(index + username.length).trim()
    };
  }
  
  return { rest: message };
};

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
      username: apiNotif.relatedUser.username || apiNotif.relatedUser.pseudo || '',
      avatar: (apiNotif.relatedUser as any).avatarUrl || (apiNotif.relatedUser as any).avatar_url || undefined,
      avatarUrl: (apiNotif.relatedUser as any).avatarUrl || (apiNotif.relatedUser as any).avatar_url || undefined,
      walletAddress: '',
      reputation: 0,
    } : undefined,
    post: apiNotif.relatedPost ? {
      id: apiNotif.relatedPost.id,
      title: apiNotif.relatedPost.title,
      slug: apiNotif.relatedPost.slug,
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
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use real-time notifications hook
  const {
    notifications: apiNotifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
  } = useRealtimeNotifications({
    pollInterval: 15000, // Poll every 15 seconds
    autoFetch: isAuthenticated,
    limit: 6,
  });

  // Map API notifications to app format
  const notifications = apiNotifications.map(mapApiNotification);

  // Refresh when dropdown opens
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      refresh();
    }
  }, [isOpen, isAuthenticated, refresh]);

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
    event.preventDefault();
    try {
      await markAsRead(id);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNotificationClick = (notification: AppNotification, event: React.MouseEvent) => {
    // Don't navigate if clicking on a username link
    if ((event.target as HTMLElement).closest('span[class*="cursor-pointer"]')) {
      return;
    }

    if (!notification.actionUrl) {
      // Fallback: try to navigate to post if available
      if (notification.post) {
        const postSlug = notification.post.slug || notification.post.id;
        navigate(`/post/${postSlug}`);
        if (!notification.isRead) markAsRead(notification.id).catch(console.error);
        return;
      }
      // Final fallback: navigate to user profile
      if (notification.user) {
        navigate(`/profile/${notification.user.username}`);
        if (!notification.isRead) markAsRead(notification.id).catch(console.error);
      }
      return;
    }

    event.preventDefault();
    setIsOpen(false);
    
    const url = notification.actionUrl;
    
    // Extract slug/ID from URL - handle both absolute and relative URLs
    const extractSlugFromUrl = (url: string, pattern: string): string | null => {
      // Handle relative URLs
      if (url.startsWith('/')) {
        const match = url.match(new RegExp(`${pattern}([^/#?]+)`));
        return match ? match[1] : null;
      }
      // Handle absolute URLs
      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const match = pathname.match(new RegExp(`${pattern}([^/#?]+)`));
        return match ? match[1] : null;
      } catch {
        // Fallback to regex on full URL
        const match = url.match(new RegExp(`${pattern}([^/#?]+)`));
        return match ? match[1] : null;
      }
    };

    // Hackathons - check actionUrl for hackathon routes
    if (url.includes('/hackathons/') || url.includes('/hackathon/')) {
      const slug = extractSlugFromUrl(url, '/hackathons?/');
      if (slug) {
        navigate(`/hackathons/${slug}`);
        if (!notification.isRead) markAsRead(notification.id).catch(console.error);
        return;
      }
    }
    
    // Events - check actionUrl for event routes
    if (url.includes('/events/') || url.includes('/event/')) {
      const slug = extractSlugFromUrl(url, '/events?/');
      if (slug) {
        navigate(`/events/${slug}`);
        if (!notification.isRead) markAsRead(notification.id).catch(console.error);
        return;
      }
    }
    
    // Opportunities - check actionUrl for opportunity routes
    if (url.includes('/opportunities/') || url.includes('/opportunity/')) {
      const slug = extractSlugFromUrl(url, '/opportunities?/');
      if (slug) {
        navigate(`/opportunities/${slug}`);
        if (!notification.isRead) markAsRead(notification.id).catch(console.error);
        return;
      }
    }
    
    // Posts - use /post/ route (singular)
    if (url.includes('/post/') || url.includes('/posts/')) {
      const slug = extractSlugFromUrl(url, '/posts?/');
      if (slug) {
        const hash = url.includes('#') ? '#' + url.split('#')[1].split('?')[0] : '';
        navigate(`/post/${slug}${hash}`);
        if (!notification.isRead) markAsRead(notification.id).catch(console.error);
        return;
      }
    }
    
    // Pages
    if (url.includes('/pages/') || url.includes('/page/')) {
      const slug = extractSlugFromUrl(url, '/pages?/');
      if (slug) {
        navigate(`/pages/${slug}`);
        if (!notification.isRead) markAsRead(notification.id).catch(console.error);
        return;
      }
    }
    
    // Profile
    if (url.includes('/profile/') || url.includes('/users/') || url.includes('/user/')) {
      const username = extractSlugFromUrl(url, '/(users?|profile)/');
      if (username) {
        navigate(`/profile/${username}`);
        if (!notification.isRead) markAsRead(notification.id).catch(console.error);
        return;
      }
    }
    
    // Default: navigate to actionUrl as-is if it's a relative URL
    if (url.startsWith('/')) {
      navigate(url);
      if (!notification.isRead) {
        markAsRead(notification.id).catch(console.error);
      }
      return;
    }

    // Fallback: try to navigate to post if available
    if (notification.post) {
      const postSlug = notification.post.slug || notification.post.id;
      navigate(`/post/${postSlug}`);
      if (!notification.isRead) markAsRead(notification.id).catch(console.error);
      return;
    }

    // Final fallback: navigate to user profile
    if (notification.user) {
      navigate(`/profile/${notification.user.username}`);
      if (!notification.isRead) markAsRead(notification.id).catch(console.error);
    }
  };

  const handleDelete = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    try {
      await deleteNotification(id);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-zinc-100"
        aria-label="Notifications"
        type="button"
      >
        <Bell size={20} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-[380px] overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-lg animate-fade-in dark:border-white/10 dark:bg-zinc-900 sm:w-[420px]">
          <div className="flex items-center justify-between border-b border-zinc-100 p-4 dark:border-white/[0.06] dark:bg-zinc-900/80">
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/[0.06]"
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
                  <div
                    key={notification.id}
                    onClick={(e) => handleNotificationClick(notification, e)}
                    className={`relative group p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all cursor-pointer border-b border-gray-100 dark:border-gray-800 ${
                      !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      {notification.user ? (
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/profile/${notification.user?.username}`);
                          }}
                          className="cursor-pointer"
                        >
                          <Avatar
                            src={notification.user.avatar || notification.user.avatarUrl || ''}
                            alt={notification.user.username}
                            size="sm"
                            className="flex-shrink-0 flex-shrink-0"

                        />
                        </div>
                      ) : (
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                          <Icon size={18} className="text-white" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                            {notification.title}
                          </p>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.isRead && (
                              <button
                                onClick={(e) => handleMarkAsRead(notification.id, e)}
                                className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                                title="Mark as read"
                              >
                                <Check size={14} className="text-blue-600 dark:text-blue-400" />
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDelete(notification.id, e)}
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                              title="Delete"
                            >
                              <X size={14} className="text-red-600 dark:text-red-400" />
                            </button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                          {notification.user ? (() => {
                            const parsed = parseNotificationMessage(notification.message, notification.user.username);
                            return (
                              <span>
                                {parsed.username && (
                                  <>
                                    <span
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/profile/${notification.user?.username}`);
                                      }}
                                      className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer transition-colors hover:underline"
                                    >
                                      {parsed.username}
                                    </span>
                                    {' '}
                                  </>
                                )}
                                <span>{parsed.rest}</span>
                              </span>
                            );
                          })() : (
                            <span>{notification.message}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
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
