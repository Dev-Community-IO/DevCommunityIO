import { useState, useEffect } from 'react';
import {
  Bell,
  MessageCircle,
  Heart,
  AtSign,
  UserPlus,
  FileText,
  Award,
  Loader2,
  Bookmark,
  Smile,
  ShieldCheck,
  Check,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { Notification as AppNotification, NotificationType } from '../types';
import notificationsService from '../services/api/notifications.service';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';
import { useNavigate } from 'react-router-dom';
import { isNetworkError } from '../services/api/config';
import { TabPills } from './TabPills';
import { ListingPageHeader } from './listingPageChrome';
import { asidePanelClass, asideGhostBtnClass } from './postCardSurface';
import {
  mapApiNotification,
  navigateFromNotification,
  NotificationRow,
} from './notificationUi';

interface NotificationsPageProps {
  onBack: () => void;
}

type FilterId = NotificationType | 'all' | 'comments';

const FILTER_TABS: { id: FilterId; label: string; icon: typeof Bell }[] = [
  { id: 'all', label: 'All', icon: Bell },
  { id: 'comments', label: 'Comments', icon: MessageCircle },
  { id: 'mention', label: 'Mentions', icon: AtSign },
  { id: 'follow', label: 'Follows', icon: UserPlus },
  { id: 'upvote', label: 'Votes', icon: Heart },
  { id: 'reaction', label: 'Reactions', icon: Smile },
  { id: 'post', label: 'Posts', icon: FileText },
  { id: 'achievement', label: 'Badges', icon: Award },
  { id: 'bookmark', label: 'Saved', icon: Bookmark },
  { id: 'verification', label: 'Verify', icon: ShieldCheck },
];

function matchesFilter(notification: AppNotification, filter: FilterId): boolean {
  if (filter === 'all') return true;
  if (filter === 'comments') return notification.type === 'comment' || notification.type === 'reply';
  return notification.type === filter;
}

export function NotificationsPage({ onBack }: NotificationsPageProps) {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [page, setPage] = useState(1);
  const [allNotifications, setAllNotifications] = useState<AppNotification[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

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

  useEffect(() => {
    const loadMoreNotifications = async () => {
      if (page === 1) return;
      try {
        setLoadingMore(true);
        const response = await notificationsService.getNotifications({
          page,
          limit: 20,
          unreadOnly: showUnreadOnly,
        });
        const notificationsList = response.data || response.notifications || response || [];
        const mapped = (Array.isArray(notificationsList) ? notificationsList : []).map(mapApiNotification);
        setAllNotifications((prev) => [...prev, ...mapped]);
        const meta = response.meta || {};
        setHasMore(meta.currentPage < meta.lastPage);
      } catch (err: unknown) {
        if (!isNetworkError(err)) console.error('Error loading more notifications:', err);
      } finally {
        setLoadingMore(false);
      }
    };
    if (page > 1) loadMoreNotifications();
  }, [page, showUnreadOnly]);

  const notifications =
    page === 1
      ? apiNotifications.map(mapApiNotification)
      : [...apiNotifications.map(mapApiNotification), ...allNotifications];

  useEffect(() => {
    setPage(1);
    setAllNotifications([]);
  }, [activeFilter, showUnreadOnly]);

  const filteredNotifications = notifications.filter((n) => {
    const matchesUnread = !showUnreadOnly || !n.isRead;
    return matchesFilter(n, activeFilter) && matchesUnread;
  });

  const hasActiveFilters = showUnreadOnly || activeFilter !== 'all';
  const activeFilterLabel = FILTER_TABS.find((t) => t.id === activeFilter)?.label ?? 'All';

  const handleNotificationClick = (notification: AppNotification, event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest('[role="link"]')) return;
    navigateFromNotification(navigate, notification, markAsRead);
  };

  const handleUserClick = (username: string, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    navigate(`/profile/${username}`);
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-zinc-400" strokeWidth={2} />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading notifications…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ListingPageHeader
        icon={Bell}
        title="Notifications"
        subtitle="Stay on top of comments, mentions, follows, and activity on your content."
        onBack={onBack}
        count={unreadCount}
        countLabel={unreadCount === 1 ? ' unread' : ' unread'}
      />

      <div className={`${asidePanelClass} overflow-hidden`}>
        <div className="flex min-h-10 items-center gap-2 px-2 py-1.5 sm:px-3">
          <button
            type="button"
            onClick={() => setFiltersExpanded((o) => !o)}
            className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg border border-zinc-200/80 bg-zinc-50/90 px-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300 dark:hover:bg-white/[0.08]"
            aria-expanded={filtersExpanded}
          >
            <SlidersHorizontal size={14} strokeWidth={2} aria-hidden />
            Filters
            <ChevronDown
              size={14}
              className={`text-zinc-400 transition-transform ${filtersExpanded ? 'rotate-180' : ''}`}
              aria-hidden
            />
          </button>

          <button
            type="button"
            onClick={() => setShowUnreadOnly((v) => !v)}
            className={`inline-flex h-8 shrink-0 items-center gap-1 rounded-lg border px-2.5 text-xs font-medium transition-colors ${
              showUnreadOnly
                ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                : 'border-zinc-200/80 bg-white/90 text-zinc-600 hover:bg-zinc-100 dark:border-white/10 dark:bg-black/25 dark:text-zinc-400 dark:hover:bg-white/10'
            }`}
          >
            Unread only
          </button>

          {!filtersExpanded && activeFilter !== 'all' && (
            <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">{activeFilterLabel}</span>
          )}

          <p className="min-w-0 flex-1 truncate text-right text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
            {filteredNotifications.length} shown
          </p>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllAsRead().catch(console.error)}
              className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg border border-zinc-200/80 px-2.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/[0.08]"
            >
              <Check size={14} strokeWidth={2} aria-hidden />
              <span className="hidden sm:inline">Mark all read</span>
            </button>
          )}
        </div>

        {filtersExpanded && (
          <div className="overflow-x-auto border-t border-zinc-100 px-2 py-2 scrollbar-hide dark:border-white/[0.06] sm:px-3">
            <TabPills
              ariaLabel="Notification type filters"
              activeTab={activeFilter}
              onChange={(id) => setActiveFilter(id as FilterId)}
              scrollable
              size="sm"
              tabs={FILTER_TABS}
            />
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setShowUnreadOnly(false);
                  setActiveFilter('all');
                }}
                className="mt-2 text-[11px] font-medium text-zinc-500 transition-colors hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {filteredNotifications.length === 0 ? (
        <div className={`${asidePanelClass} px-6 py-16 text-center`}>
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200/80 bg-zinc-50 text-zinc-400 dark:border-white/10 dark:bg-white/[0.04]">
            <Bell size={22} strokeWidth={1.75} />
          </span>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">All caught up</h3>
          <p className="mx-auto mt-1 max-w-xs text-xs text-zinc-500 dark:text-zinc-400">
            {showUnreadOnly || activeFilter !== 'all'
              ? 'No notifications match your current filters.'
              : "We'll notify you when there's new activity."}
          </p>
        </div>
      ) : (
        <div className={`${asidePanelClass} p-2 sm:p-3`}>
          <div className="space-y-2">
            {filteredNotifications.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                variant="page"
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
            ))}
          </div>
        </div>
      )}

      {filteredNotifications.length > 0 && hasMore && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={loadingMore}
            className={`${asideGhostBtnClass} !w-auto px-4`}
          >
            {loadingMore ? (
              <>
                <Loader2 size={14} className="animate-spin" strokeWidth={2} aria-hidden />
                Loading…
              </>
            ) : (
              'Load more'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
