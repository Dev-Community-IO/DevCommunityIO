import { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Check, Trash2, MessageCircle, Heart, AtSign, UserPlus, FileText, Award, Loader2, Bookmark, Smile, Share2, Users, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { Notification as AppNotification, NotificationType } from '../types';
import { Avatar } from './Avatar';
import { GlassCard } from './GlassCard';
import { Badge } from './Badge';
import notificationsService, { type Notification } from '../services/api/notifications.service';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';
import { useNavigate } from 'react-router-dom';
import { isNetworkError } from '../services/api/config';

interface NotificationsPageProps {
  onBack: () => void;
}

const filterOptions: { id: string; label: string; type: NotificationType | 'all'; icon: any }[] = [
  { id: 'all', label: 'All', type: 'all', icon: Bell },
  { id: 'comment', label: 'Comments', type: 'comment', icon: MessageCircle },
  { id: 'reply', label: 'Replies', type: 'reply', icon: MessageCircle },
  { id: 'upvote', label: 'Upvotes', type: 'upvote', icon: Heart },
  { id: 'mention', label: 'Mentions', type: 'mention', icon: AtSign },
  { id: 'follow', label: 'Follows', type: 'follow', icon: UserPlus },
  { id: 'post', label: 'Posts', type: 'post', icon: FileText },
  { id: 'achievement', label: 'Achievements', type: 'achievement', icon: Award },
  { id: 'bookmark', label: 'Bookmarks', type: 'bookmark' as NotificationType, icon: Bookmark },
  { id: 'reaction', label: 'Reactions', type: 'reaction' as NotificationType, icon: Smile },
  { id: 'verification', label: 'Verification', type: 'verification' as NotificationType, icon: ShieldCheck },
];

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
      return Bell;
    default:
      return Bell;
  }
};

const getNotificationColor = (type: NotificationType | string) => {
  switch (type) {
    case 'comment':
    case 'reply':
      return 'text-blue-500 bg-blue-50 dark:bg-blue-950/20';
    case 'upvote':
      return 'text-red-500 bg-red-50 dark:bg-red-950/20';
    case 'mention':
      return 'text-purple-500 bg-purple-50 dark:bg-purple-950/20';
    case 'follow':
      return 'text-green-500 bg-green-50 dark:bg-green-950/20';
    case 'post':
      return 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/20';
    case 'achievement':
      return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
    case 'bookmark':
      return 'text-amber-500 bg-amber-50 dark:bg-amber-950/20';
    case 'reaction':
      return 'text-pink-500 bg-pink-50 dark:bg-pink-950/20';
    case 'share':
      return 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20';
    case 'page_invite':
      return 'text-teal-500 bg-teal-50 dark:bg-teal-950/20';
    case 'verification':
      return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20';
    case 'system':
      return 'text-gray-500 bg-gray-50 dark:bg-gray-950/20';
    default:
      return 'text-gray-500 bg-gray-50 dark:bg-gray-950/20';
  }
};

const formatTimestamp = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

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
      avatar: apiNotif.relatedUser.avatar_url || apiNotif.relatedUser.avatarUrl || undefined,
      avatarUrl: apiNotif.relatedUser.avatar_url || apiNotif.relatedUser.avatarUrl || undefined,
      walletAddress: '',
      reputation: 0,
      isVerified: apiNotif.relatedUser.isVerified || false,
    } : undefined,
    post: apiNotif.relatedPost ? {
      id: apiNotif.relatedPost.id,
      title: apiNotif.relatedPost.title,
      slug: apiNotif.relatedPost.slug,
    } : undefined,
    actionUrl: apiNotif.actionUrl,
  };
};

export function NotificationsPage({ onBack }: NotificationsPageProps) {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<NotificationType | 'all'>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [allNotifications, setAllNotifications] = useState<AppNotification[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Use real-time notifications hook for recent notifications
  const {
    notifications: apiNotifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useRealtimeNotifications({
    pollInterval: 20000,
    autoFetch: true,
    limit: 20,
  });

  // Load more notifications for pagination
  useEffect(() => {
    const loadMoreNotifications = async () => {
      if (page === 1) return;
      
      try {
        setLoadingMore(true);
        const response = await notificationsService.getNotifications({ 
          page, 
          limit: 20,
          unreadOnly: showUnreadOnly 
        });
        
        const notificationsList = response.data || response.notifications || response || [];
        const mapped = notificationsList.map(mapApiNotification);
        
        setAllNotifications(prev => [...prev, ...mapped]);
        
        const meta = response.meta || {};
        setHasMore(meta.currentPage < meta.lastPage);
      } catch (err: any) {
        // Suppress network errors - they're handled gracefully
        if (!isNetworkError(err)) {
          console.error('Error loading more notifications:', err);
        }
      } finally {
        setLoadingMore(false);
      }
    };

    if (page > 1) {
      loadMoreNotifications();
    }
  }, [page, showUnreadOnly]);

  // Combine real-time notifications with paginated ones
  const notifications = page === 1 
    ? apiNotifications.map(mapApiNotification)
    : [...apiNotifications.map(mapApiNotification), ...allNotifications];

  // Reset to page 1 when filter changes
  useEffect(() => {
    setPage(1);
    setAllNotifications([]);
  }, [activeFilter, showUnreadOnly]);

  const filteredNotifications = notifications.filter(n => {
    const matchesFilter = activeFilter === 'all' || n.type === activeFilter;
    const matchesUnread = !showUnreadOnly || !n.isRead;
    return matchesFilter && matchesUnread;
  });

  const handleNotificationClick = (notification: AppNotification, event?: React.MouseEvent) => {
    // Don't navigate if clicking on a username link
    if (event && (event.target as HTMLElement).closest('span[class*="cursor-pointer"]')) {
      return;
    }

    // Handle content-specific routes based on actionUrl patterns
    if (notification.actionUrl) {
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
      
      // Users/Profiles
      if (url.includes('/users/') || url.includes('/profile/') || url.includes('/user/')) {
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
        if (!notification.isRead) markAsRead(notification.id).catch(console.error);
        return;
      }
    }

    // Fallback: try to navigate to post if available
    if (notification.post) {
      const postSlug = notification.post.slug || notification.post.id;
      navigate(`/post/${postSlug}`);
      if (!notification.isRead) {
        markAsRead(notification.id).catch(console.error);
      }
      return;
    }

    // Final fallback: navigate to user profile
    if (notification.user) {
      navigate(`/profile/${notification.user.username}`);
      if (!notification.isRead) {
        markAsRead(notification.id).catch(console.error);
      }
    }
  };

  const handleMarkAsRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await markAsRead(id);
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (err: any) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
    } catch (err: any) {
      console.error('Error deleting notification:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Compact Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back</span>
            </button>
            
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 size={14} />
                Mark all read
              </button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-xs px-2 py-0.5">
                  {unreadCount}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Compact Filters */}
        <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <button
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              showUnreadOnly
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {showUnreadOnly && <CheckCircle2 size={12} className="inline mr-1" />}
            Unread
          </button>
          
          {filterOptions.map(option => {
            const Icon = option.icon;
            const isActive = activeFilter === option.type;
            return (
              <button
                key={option.id}
                onClick={() => setActiveFilter(option.type)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon size={12} />
                {option.label}
              </button>
            );
          })}
        </div>

        {/* Compact Notifications List */}
        <div className="space-y-2">
          {filteredNotifications.length === 0 ? (
            <GlassCard className="p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mb-4">
                  <Bell size={32} className="text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  All caught up!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {showUnreadOnly
                    ? "No unread notifications"
                    : "We'll notify you when something new arrives"}
                </p>
              </div>
            </GlassCard>
          ) : (
            filteredNotifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const colorClass = getNotificationColor(notification.type);
              const isHovered = hoveredId === notification.id;
              const isUnread = !notification.isRead;

              return (
                <div
                  key={notification.id}
                  onClick={(e) => handleNotificationClick(notification, e)}
                  onMouseEnter={() => setHoveredId(notification.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`group relative p-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border rounded-xl transition-all duration-200 cursor-pointer ${
                    isUnread 
                      ? `${colorClass} border-purple-200 dark:border-purple-800/50 shadow-sm` 
                      : 'border-gray-200/50 dark:border-gray-800/50 hover:border-gray-300 dark:hover:border-gray-700'
                  } ${isHovered ? 'shadow-md scale-[1.01]' : ''}`}
                >
                  <div className="flex gap-3">
                    {/* Compact Avatar/Icon */}
                    {notification.user ? (
                      <div className="relative flex-shrink-0">
                        <div
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            navigate(`/profile/${notification.user?.username}`);
                          }}
                          className="cursor-pointer group/avatar"
                        >
                          <Avatar
                            src={notification.user.avatar || notification.user.avatarUrl || ''}
                            alt={notification.user.username}
                            size="md"
                            className="w-11 h-11 border-2 border-white dark:border-gray-800 group-hover/avatar:ring-2 group-hover/avatar:ring-blue-500 group-hover/avatar:ring-offset-2 dark:group-hover/avatar:ring-offset-gray-900 transition-all shadow-md hover:shadow-lg"
                          />
                        </div>
                        {isUnread && (
                          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm animate-pulse"></div>
                        )}
                      </div>
                    ) : (
                      <div className={`w-11 h-11 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0 shadow-md`}>
                        <Icon size={18} />
                      </div>
                    )}

                    {/* Compact Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className={`text-sm font-medium truncate ${
                              isUnread 
                                ? 'text-gray-900 dark:text-white' 
                                : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {notification.title}
                            </p>
                            {isUnread && (
                              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0"></span>
                            )}
                          </div>
                          <div className={`text-xs leading-relaxed ${
                            isUnread
                              ? 'text-gray-700 dark:text-gray-200'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
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
                        </div>

                        {/* Compact Actions */}
                        <div className={`flex items-center gap-1 flex-shrink-0 transition-opacity ${
                          isHovered ? 'opacity-100' : 'opacity-0'
                        }`}>
                          {isUnread && (
                            <button
                              onClick={(e) => handleMarkAsRead(e, notification.id)}
                              className="p-1.5 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <Check size={14} className="text-purple-600 dark:text-purple-400" />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDelete(e, notification.id)}
                            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} className="text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </div>

                      {/* Compact Footer */}
                      <div className="flex items-center gap-3 mt-1.5 pt-1.5 border-t border-gray-200/50 dark:border-gray-800/50">
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-500">
                          <Clock size={10} />
                          {formatTimestamp(notification.timestamp)}
                        </div>
                        {notification.post && (
                          <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-500">
                            <FileText size={10} />
                            <span className="truncate max-w-[120px]">{notification.post.title}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Compact Load More */}
        {filteredNotifications.length > 0 && hasMore && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setPage(prev => prev + 1)}
              disabled={loadingMore}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
            >
              {loadingMore ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
