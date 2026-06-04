import { useEffect, useState } from 'react';
import { ExternalLink, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { VerifiedBadge } from './VerifiedBadge';
import { Page } from '../types';
import pagesService from '../services/api/pages.service';
import { useAuth } from '../contexts/AuthContext';
import {
  asidePanelClass,
  asidePanelPadding,
  asideStatChipClass,
  asideGhostBtnClass,
  postCardDividerClass,
} from './postCardSurface';

const DEFAULT_PAGE_LOGO = 'https://api.dicebear.com/7.x/shapes/svg?seed=Adaex%20App';

const categoryChipClass =
  'inline-flex items-center gap-1 rounded-md border border-zinc-200/70 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400';

interface PageSidebarProps {
  page: Page | { id: string; slug?: string };
  onLoginRequired?: () => void;
  onFollowChange?: (isFollowing: boolean, followerCount: number) => void;
}

function SidebarSkeleton() {
  return (
    <div className={`${asidePanelClass} ${asidePanelPadding} animate-pulse`}>
      <div className="flex gap-3">
        <div className="h-12 w-12 shrink-0 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3.5 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-3 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
      <div className="mt-3 h-8 rounded bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}

export function PageSidebar({ page: pageProp, onLoginRequired, onFollowChange }: PageSidebarProps) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [pageData, setPageData] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);

        const identifier = (pageProp as Page).slug || (pageProp as Page).id;
        if (!identifier) {
          if ('name' in pageProp && pageProp.name) {
            const page = pageProp as Page;
            const isFollowingFromProp = page?.isFollowing === true;
            setIsFollowing(isFollowingFromProp);
            setPageData({ ...page, isFollowing: isFollowingFromProp });
            setLoading(false);
          }
          return;
        }

        const pageResponse = await pagesService.getPage(identifier);
        const pageDataFromApi = pageResponse.page || pageResponse;
        const isFollowingFromApi = pageDataFromApi?.isFollowing === true;

        setIsFollowing(isFollowingFromApi);
        setPageData({
          ...pageDataFromApi,
          isFollowing: isFollowingFromApi,
          followerCount: pageDataFromApi?.followerCount || pageDataFromApi?.follower_count || 0,
        });
      } catch (error) {
        console.error('Error fetching page data:', error);
        if ('name' in pageProp && pageProp.name) {
          const page = pageProp as Page;
          const isFollowingFromProp = page?.isFollowing === true;
          setIsFollowing(isFollowingFromProp);
          setPageData({ ...page, isFollowing: isFollowingFromProp });
        } else {
          setPageData(null);
        }
      } finally {
        setLoading(false);
      }
    };

    if (pageProp) {
      fetchPageData();
    }
  }, [pageProp, user?.id, isAuthenticated]);

  useEffect(() => {
    if ('name' in pageProp && pageProp.name && (pageProp as Page).isFollowing !== undefined) {
      const page = pageProp as Page;
      const isFollowingFromProp = page?.isFollowing === true;
      if (isFollowingFromProp !== isFollowing) {
        setIsFollowing(isFollowingFromProp);
        setPageData((prev) => (prev ? { ...prev, isFollowing: isFollowingFromProp } : null));
      }
    }
  }, [(pageProp as Page)?.isFollowing]);

  const isOwnerOrAdmin =
    isAuthenticated &&
    user &&
    pageData &&
    (pageData.ownerId === user.id ||
      pageData.owner?.id === user.id ||
      pageData.userRole === 'owner' ||
      pageData.userRole === 'admin' ||
      ['owner', 'admin'].includes(pageData.userRole || ''));

  const handleFollow = async () => {
    if (!isAuthenticated) {
      onLoginRequired?.();
      return;
    }

    if (!pageData?.id) return;

    const currentFollowing = isFollowing;

    try {
      const response = currentFollowing
        ? await pagesService.leavePage(pageData.id)
        : await pagesService.joinPage(pageData.id);

      const newIsFollowing = response?.isFollowing === true;
      const newFollowerCount = response?.followerCount ?? pageData.followerCount;

      setIsFollowing(newIsFollowing);
      if (pageData) {
        setPageData({
          ...pageData,
          isFollowing: newIsFollowing,
          followerCount: newFollowerCount,
        });
      }

      onFollowChange?.(newIsFollowing, newFollowerCount);
    } catch (error) {
      console.error('Error following/unfollowing page:', error);
      setIsFollowing(currentFollowing);
    }
  };

  if (loading) return <SidebarSkeleton />;
  if (!pageData) return null;

  const followerCount = pageData.followerCount || pageData.follower_count || 0;
  const postCount = pageData.postCount || 0;

  return (
    <section className={`${asidePanelClass} ${asidePanelPadding}`} aria-label="Page">
      <div className="space-y-2.5">
        <div className="flex items-start gap-2.5">
          <button
            type="button"
            onClick={() => pageData.slug && navigate(`/pages/${pageData.slug}`)}
            className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-zinc-200/80 bg-zinc-50 transition-opacity hover:opacity-90 dark:border-white/10 dark:bg-zinc-900/80"
          >
            <img
              src={pageData.logo || pageData.logoUrl || DEFAULT_PAGE_LOGO}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_PAGE_LOGO;
              }}
            />
          </button>

          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => pageData.slug && navigate(`/pages/${pageData.slug}`)}
              className="inline-flex max-w-full items-center gap-1 text-left"
            >
              <span className="truncate text-sm font-semibold text-zinc-900 transition-colors hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300">
                {pageData.name}
              </span>
              {pageData.isVerified && <VerifiedBadge variant="page" size={14} className="shrink-0" />}
            </button>

            {pageData.category && (
              <div className="mt-1">
                <span className={categoryChipClass}>
                  <Building2 size={10} className="shrink-0 opacity-70" />
                  {pageData.category}
                </span>
              </div>
            )}
          </div>
        </div>

        {pageData.description && (
          <p className="line-clamp-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
            {pageData.description}
          </p>
        )}

        <div className={`flex flex-wrap gap-1.5 pt-0.5 ${postCardDividerClass}`}>
          <span className={asideStatChipClass}>
            <span className="text-xs font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
              {followerCount.toLocaleString()}
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">followers</span>
          </span>
          <span className={asideStatChipClass}>
            <span className="text-xs font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
              {postCount.toLocaleString()}
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">posts</span>
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          {!isOwnerOrAdmin && (
            <Button
              variant={isFollowing ? 'secondary' : 'primary'}
              onClick={handleFollow}
              className="h-8 w-full text-xs"
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}

          <button type="button" onClick={() => pageData.slug && navigate(`/pages/${pageData.slug}`)} className={asideGhostBtnClass}>
            <ExternalLink size={14} strokeWidth={2} />
            View page
          </button>
        </div>
      </div>
    </section>
  );
}
