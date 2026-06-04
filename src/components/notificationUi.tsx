import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  MessageCircle,
  Heart,
  AtSign,
  UserPlus,
  FileText,
  Award,
  Bookmark,
  Smile,
  Share2,
  Users,
  ShieldCheck,
  Settings,
  Check,
  Trash2,
  X,
  Clock,
} from 'lucide-react';
import type { NavigateFunction } from 'react-router-dom';
import { Notification as AppNotification, NotificationType } from '../types';
import { Avatar } from './Avatar';
import { postMentionClass } from './postCardSurface';
import type { Notification as ApiNotification } from '../services/api/notifications.service';

export const formatNotificationTime = (date: Date, compact = false) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return compact ? 'now' : 'Just now';
  if (minutes < 60) return compact ? `${minutes}m` : `${minutes}m ago`;
  if (hours < 24) return compact ? `${hours}h` : `${hours}h ago`;
  if (days < 7) return compact ? `${days}d` : `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const parseNotificationMessage = (
  message: string,
  username?: string
): { username?: string; rest: string } => {
  if (!username) return { rest: message };
  if (message.startsWith(username)) {
    return { username, rest: message.substring(username.length).trim() };
  }
  const index = message.indexOf(username);
  if (index !== -1) {
    return {
      username,
      rest:
        message.substring(0, index).trim() +
        ' ' +
        message.substring(index + username.length).trim(),
    };
  }
  return { rest: message };
};

export const mapApiNotification = (apiNotif: ApiNotification): AppNotification => ({
  id: apiNotif.id,
  type: apiNotif.type as NotificationType,
  title: apiNotif.title,
  message: apiNotif.message,
  timestamp: new Date(apiNotif.createdAt),
  isRead: apiNotif.isRead,
  user: apiNotif.relatedUser
    ? {
        id: apiNotif.relatedUser.id,
        username: apiNotif.relatedUser.username || apiNotif.relatedUser.pseudo || '',
        avatar:
          apiNotif.relatedUser.avatar_url ||
          apiNotif.relatedUser.avatarUrl ||
          (apiNotif.relatedUser as { avatarUrl?: string }).avatarUrl ||
          undefined,
        avatarUrl:
          apiNotif.relatedUser.avatar_url ||
          apiNotif.relatedUser.avatarUrl ||
          undefined,
        walletAddress: '',
        reputation: 0,
        isVerified: apiNotif.relatedUser.isVerified || false,
      }
    : undefined,
  post: apiNotif.relatedPost
    ? {
        id: apiNotif.relatedPost.id,
        title: apiNotif.relatedPost.title,
        slug: apiNotif.relatedPost.slug,
      }
    : undefined,
  actionUrl: apiNotif.actionUrl,
});

export const getNotificationIcon = (type: NotificationType | string): LucideIcon => {
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

/** Muted icon tint per type — no gradient badges */
export const getNotificationIconTint = (type: NotificationType | string): string => {
  switch (type) {
    case 'comment':
    case 'reply':
      return 'text-sky-600 dark:text-sky-400';
    case 'upvote':
      return 'text-rose-600 dark:text-rose-400';
    case 'mention':
      return 'text-violet-600 dark:text-violet-400';
    case 'follow':
      return 'text-emerald-600 dark:text-emerald-400';
    case 'post':
      return 'text-cyan-600 dark:text-cyan-400';
    case 'achievement':
      return 'text-amber-600 dark:text-amber-400';
    case 'bookmark':
      return 'text-amber-700 dark:text-amber-500';
    case 'reaction':
      return 'text-pink-600 dark:text-pink-400';
    case 'share':
      return 'text-indigo-600 dark:text-indigo-400';
    case 'page_invite':
      return 'text-teal-600 dark:text-teal-400';
    case 'verification':
      return 'text-emerald-600 dark:text-emerald-400';
    default:
      return 'text-zinc-500 dark:text-zinc-400';
  }
};

const extractSlugFromUrl = (url: string, pattern: string): string | null => {
  if (url.startsWith('/')) {
    const match = url.match(new RegExp(`${pattern}([^/#?]+)`));
    return match ? match[1] : null;
  }
  try {
    const pathname = new URL(url).pathname;
    const match = pathname.match(new RegExp(`${pattern}([^/#?]+)`));
    return match ? match[1] : null;
  } catch {
    const match = url.match(new RegExp(`${pattern}([^/#?]+)`));
    return match ? match[1] : null;
  }
};

export function navigateFromNotification(
  navigate: NavigateFunction,
  notification: AppNotification,
  markAsRead: (id: string) => Promise<void>
) {
  const markReadIfNeeded = () => {
    if (!notification.isRead) markAsRead(notification.id).catch(console.error);
  };

  const url = notification.actionUrl;
  if (url) {
    if (url.includes('/hackathons/') || url.includes('/hackathon/')) {
      const slug = extractSlugFromUrl(url, '/hackathons?/');
      if (slug) {
        navigate(`/hackathons/${slug}`);
        markReadIfNeeded();
        return;
      }
    }
    if (url.includes('/events/') || url.includes('/event/')) {
      const slug = extractSlugFromUrl(url, '/events?/');
      if (slug) {
        navigate(`/events/${slug}`);
        markReadIfNeeded();
        return;
      }
    }
    if (url.includes('/opportunities/') || url.includes('/opportunity/')) {
      const slug = extractSlugFromUrl(url, '/opportunities?/');
      if (slug) {
        navigate(`/opportunities/${slug}`);
        markReadIfNeeded();
        return;
      }
    }
    if (url.includes('/post/') || url.includes('/posts/')) {
      const slug = extractSlugFromUrl(url, '/posts?/');
      if (slug) {
        const hash = url.includes('#') ? '#' + url.split('#')[1].split('?')[0] : '';
        navigate(`/post/${slug}${hash}`);
        markReadIfNeeded();
        return;
      }
    }
    if (url.includes('/pages/') || url.includes('/page/')) {
      const slug = extractSlugFromUrl(url, '/pages?/');
      if (slug) {
        navigate(`/pages/${slug}`);
        markReadIfNeeded();
        return;
      }
    }
    if (url.includes('/profile') || url.includes('/users/') || url.includes('/user/')) {
      const username = extractSlugFromUrl(url, '/(?:users?|profile)/');
      if (username) {
        const queryIndex = url.indexOf('?');
        const hashIndex = url.indexOf('#');
        const suffix =
          queryIndex !== -1
            ? url.substring(queryIndex)
            : hashIndex !== -1
              ? url.substring(hashIndex)
              : '';
        navigate(`/profile/${username}${suffix}`);
        markReadIfNeeded();
        return;
      }
    }
    if (url.startsWith('/')) {
      navigate(url);
      markReadIfNeeded();
      return;
    }
  }

  if (notification.post) {
    navigate(`/post/${notification.post.slug || notification.post.id}`);
    markReadIfNeeded();
    return;
  }
  if (notification.user) {
    navigate(`/profile/${notification.user.username}`);
    markReadIfNeeded();
  }
}

function NotificationMessage({
  notification,
  onUserClick,
}: {
  notification: AppNotification;
  onUserClick: (username: string, e: React.MouseEvent) => void;
}) {
  if (!notification.user) {
    return <span className="line-clamp-2">{notification.message}</span>;
  }
  const parsed = parseNotificationMessage(notification.message, notification.user.username);
  return (
    <span className="line-clamp-2">
      {parsed.username && (
        <>
          <span
            role="link"
            tabIndex={0}
            onClick={(e) => onUserClick(notification.user!.username, e)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onUserClick(notification.user!.username, e as unknown as React.MouseEvent);
            }}
            className={`${postMentionClass} cursor-pointer`}
          >
            {parsed.username}
          </span>{' '}
        </>
      )}
      <span>{parsed.rest}</span>
    </span>
  );
}

export function NotificationRow({
  notification,
  variant,
  onNavigate,
  onMarkRead,
  onDelete,
  onUserClick,
}: {
  notification: AppNotification;
  variant: 'dropdown' | 'page';
  onNavigate: (e: React.MouseEvent) => void;
  onMarkRead?: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onUserClick: (username: string, e: React.MouseEvent) => void;
}) {
  const Icon = getNotificationIcon(notification.type);
  const iconTint = getNotificationIconTint(notification.type);
  const isUnread = !notification.isRead;
  const compact = variant === 'dropdown';

  const rowClass = compact
    ? `group relative flex cursor-pointer gap-2.5 px-3 py-2.5 transition-colors hover:bg-zinc-50 dark:hover:bg-white/[0.03] ${
        isUnread ? 'bg-zinc-50/80 dark:bg-white/[0.02]' : ''
      }`
    : `group relative flex cursor-pointer gap-3 rounded-lg border px-3 py-3 transition-colors ${
        isUnread
          ? 'border-zinc-300/80 bg-zinc-50/90 dark:border-white/[0.12] dark:bg-white/[0.04]'
          : 'border-zinc-200/60 bg-white/50 hover:border-zinc-300/80 hover:bg-zinc-50/80 dark:border-white/[0.06] dark:bg-transparent dark:hover:border-white/[0.1] dark:hover:bg-white/[0.03]'
      }`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onNavigate}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onNavigate(e as unknown as React.MouseEvent);
      }}
      className={rowClass}
    >
      {isUnread && (
        <span
          className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-zinc-900 dark:bg-zinc-100"
          aria-hidden
        />
      )}

      {notification.user ? (
        <button
          type="button"
          onClick={(e) => onUserClick(notification.user!.username, e)}
          className="relative shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
        >
          <Avatar
            src={notification.user.avatar || notification.user.avatarUrl || ''}
            alt={notification.user.username}
            size={compact ? 'sm' : 'md'}
          />
          {isUnread && (
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-white bg-zinc-900 dark:border-zinc-900 dark:bg-zinc-100" />
          )}
        </button>
      ) : (
        <span
          className={`flex shrink-0 items-center justify-center rounded-lg border border-zinc-200/80 bg-zinc-50 dark:border-white/10 dark:bg-white/[0.04] ${
            compact ? 'h-9 w-9' : 'h-11 w-11'
          }`}
        >
          <Icon size={compact ? 16 : 18} strokeWidth={2} className={iconTint} aria-hidden />
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`min-w-0 truncate font-medium leading-snug ${
              compact ? 'text-xs' : 'text-sm'
            } ${isUnread ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-700 dark:text-zinc-300'}`}
          >
            {notification.title}
          </p>
          <div className="flex shrink-0 items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
            {isUnread && onMarkRead && (
              <button
                type="button"
                onClick={onMarkRead}
                className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/[0.06] dark:hover:text-zinc-200"
                title="Mark as read"
              >
                <Check size={14} strokeWidth={2} />
              </button>
            )}
            <button
              type="button"
              onClick={onDelete}
              className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
              title="Remove"
            >
              {compact ? <X size={14} strokeWidth={2} /> : <Trash2 size={14} strokeWidth={2} />}
            </button>
          </div>
        </div>

        <p
          className={`mt-0.5 leading-relaxed ${
            compact ? 'text-[11px]' : 'text-xs'
          } text-zinc-500 dark:text-zinc-400`}
        >
          <NotificationMessage notification={notification} onUserClick={onUserClick} />
        </p>

        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-zinc-400 dark:text-zinc-500">
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Clock size={10} strokeWidth={2} aria-hidden />
            {formatNotificationTime(notification.timestamp, !compact)}
          </span>
          {notification.post && !compact && (
            <span className="inline-flex max-w-[10rem] items-center gap-1 truncate rounded-md border border-zinc-200/70 bg-zinc-50/80 px-1.5 py-px dark:border-white/10 dark:bg-white/[0.04]">
              <FileText size={10} strokeWidth={2} aria-hidden />
              <span className="truncate">{notification.post.title}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
