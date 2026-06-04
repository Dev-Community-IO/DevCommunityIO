import { Avatar } from './Avatar';
import { VerifiedBadge } from './VerifiedBadge';
import { PageHoverCardDropdown } from './PageHoverCardDropdown';
import { UserHoverCardDropdown } from './UserHoverCardDropdown';
import type { Page, User } from '../types';

const DEFAULT_PAGE_LOGO = 'https://api.dicebear.com/7.x/shapes/svg?seed=Adaex%20App';

const pageAvatarClass =
  'relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-zinc-100 shadow-sm ring-1 ring-zinc-200/80 transition-all duration-200 hover:shadow-md active:scale-[0.97] dark:bg-zinc-800 dark:ring-white/10 sm:h-10 sm:w-10 touch-manipulation';

const pageTriggerClass =
  'absolute left-0 top-0 z-10 flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-zinc-100 shadow-sm ring-1 ring-zinc-200/80 transition-all duration-200 hover:shadow-md active:scale-[0.97] dark:bg-zinc-800 dark:ring-white/10 sm:h-10 sm:w-10 touch-manipulation';

const authorTriggerClass =
  'absolute -bottom-0.5 -right-0.5 z-20 flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-full shadow-md ring-1 ring-zinc-200/80 transition-all duration-200 hover:shadow-lg active:scale-[0.97] dark:ring-white/10 sm:h-8 sm:w-8 touch-manipulation';

/** Single page logo for feed cards — author shown in byline only */
export function PagePostAvatar({
  page,
  onPageClick,
  onViewPage,
  onJoin,
}: {
  page: Page;
  onPageClick: (e: React.MouseEvent) => void;
  onViewPage?: () => void;
  onJoin?: () => void;
}) {
  const pageName = page.name ?? 'Page';

  return (
    <PageHoverCardDropdown
      page={page}
      trigger={
        <button
          type="button"
          onClick={onPageClick}
          className={pageAvatarClass}
          aria-label={`View ${pageName}`}
        >
          <img
            src={page.logo || page.logoUrl || DEFAULT_PAGE_LOGO}
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = DEFAULT_PAGE_LOGO;
            }}
          />
        </button>
      }
      onViewPage={onViewPage}
      onJoin={onJoin}
    />
  );
}

interface PageAuthorAvatarStackProps {
  page: Page;
  author: User;
  onPageClick: (e: React.MouseEvent) => void;
  onAuthorClick: (e: React.MouseEvent) => void;
  onViewPage?: () => void;
  onViewProfile?: () => void;
  onJoin?: () => void;
  onFollow?: () => void;
}

export function PageAuthorAvatarStack({
  page,
  author,
  onPageClick,
  onAuthorClick,
  onViewPage,
  onViewProfile,
  onJoin,
  onFollow,
}: PageAuthorAvatarStackProps) {
  const pageName = page.name ?? 'Page';
  const authorName = author.username ?? 'Author';

  return (
    <div
      className="relative h-11 w-11 shrink-0 sm:h-12 sm:w-12"
      aria-label={`${authorName} on ${pageName}`}
    >
      <PageHoverCardDropdown
        page={page}
        trigger={
          <button
            type="button"
            onClick={onPageClick}
            className={pageTriggerClass}
            aria-label={`View ${pageName}`}
          >
            <img
              src={page.logo || page.logoUrl || DEFAULT_PAGE_LOGO}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_PAGE_LOGO;
              }}
            />
            {page.isVerified && (
              <span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-white p-0.5 shadow-sm dark:bg-zinc-900">
                <VerifiedBadge variant="page" size={10} className="sm:h-3 sm:w-3" />
              </span>
            )}
          </button>
        }
        onViewPage={onViewPage}
        onJoin={onJoin}
      />
      <UserHoverCardDropdown
        user={author}
        page={page}
        trigger={
          <button
            type="button"
            onClick={onAuthorClick}
            className={authorTriggerClass}
            aria-label={`View ${authorName}`}
          >
            <Avatar
              src={author.avatar || author.avatarUrl}
              alt={authorName}
              size="sm"
              className="h-full w-full"

            />
          </button>
        }
        onViewProfile={onViewProfile}
        onFollow={onFollow}
      />
    </div>
  );
}

interface PostAuthorAvatarProps {
  author: User;
  onAuthorClick: (e: React.MouseEvent) => void;
  onViewProfile?: () => void;
  onFollow?: () => void;
}

export function PostAuthorAvatar({
  author,
  onAuthorClick,
  onViewProfile,
  onFollow,
}: PostAuthorAvatarProps) {
  const authorName = author.username ?? 'Author';

  return (
    <UserHoverCardDropdown
      user={author}
      trigger={
        <button
          type="button"
          onClick={onAuthorClick}
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full shadow-sm ring-1 ring-zinc-200/80 transition-all duration-200 hover:shadow-md active:scale-[0.97] dark:ring-white/10 sm:h-10 sm:w-10 touch-manipulation"
          aria-label={`View ${authorName}`}
        >
          <Avatar
            src={author.avatar || author.avatarUrl}
            alt={authorName}
            size="sm"
            className="h-full w-full"
          />
        </button>
      }
      onViewProfile={onViewProfile}
      onFollow={onFollow}
    />
  );
}
