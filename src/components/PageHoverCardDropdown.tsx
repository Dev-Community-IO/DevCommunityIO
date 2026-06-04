import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';
import { Badge } from './Badge';
import { Users, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import pagesService from '../services/api/pages.service';

const DEFAULT_PAGE_LOGO = 'https://api.dicebear.com/7.x/shapes/svg?seed=Adaex%20App';

const hoverCardShellClass =
  'fixed z-[9999] w-72 overflow-hidden rounded-xl border p-0 pointer-events-auto ' +
  'bg-white/95 border-zinc-200/80 shadow-lg shadow-black/5 backdrop-blur-xl ' +
  'animate-in fade-in duration-200 ' +
  'dark:border-white/10 dark:bg-zinc-900 dark:shadow-black/40';

const hoverCardHeaderFallbackClass =
  'absolute inset-0 bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-200 dark:from-[#0a1220] dark:via-[#060b14] dark:to-[#0a1020]';

const hoverCardChipClass =
  'rounded-md border border-zinc-200/70 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 ' +
  'dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400';

interface PageHoverCardDropdownProps {
  page: {
    id: string;
    name: string;
    logo?: string;
    logoUrl?: string;
    coverImage?: string;
    coverImageUrl?: string;
    description?: string;
    memberCount?: number;
    followerCount?: number;
    follower_count?: number;
    postCount?: number;
    category?: string;
    isFollowing?: boolean;
  };
  trigger: React.ReactNode;
  onJoin?: () => void;
  onViewPage?: () => void;
}

export function PageHoverCardDropdown({ page, trigger, onJoin, onViewPage }: PageHoverCardDropdownProps) {
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom'>('bottom');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const [postCount, setPostCount] = useState<number | null>(
    typeof page.postCount === 'number' ? page.postCount : null
  );
  const [followerCount, setFollowerCount] = useState(
    page.followerCount ?? page.follower_count ?? 0
  );
  const timeoutRef = useRef<NodeJS.Timeout>();
  const cardRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const [cardPosition, setCardPosition] = useState({ top: 0, left: 0 });

  const resolvedPostCount = postCount ?? page.postCount ?? 0;

  // Fetch live page stats when the card opens (post count, followers, follow state)
  useEffect(() => {
    if (!isOpen) return;

    const identifier = page.slug || page.id;
    if (!identifier) return;

    const fetchPageStats = async () => {
      try {
        const pageResponse = await pagesService.getPage(identifier);
        const pageObj = pageResponse.page || pageResponse;

        setPostCount(Number(pageObj?.postCount ?? 0));
        setFollowerCount(
          Number(pageObj?.followerCount ?? pageObj?.follower_count ?? 0)
        );

        if (isAuthenticated && user?.id) {
          setIsFollowing(pageObj?.isFollowing === true);
        }
      } catch (error) {
        console.error('Error fetching page stats:', error);
      }
    };

    fetchPageStats();
  }, [isOpen, page.id, page.slug, isAuthenticated, user?.id]);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsFollowing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (typeof page.isFollowing === 'boolean') {
      setIsFollowing(page.isFollowing);
    }
    if (typeof page.postCount === 'number') {
      setPostCount(page.postCount);
    }
    const nextFollowers = page.followerCount ?? page.follower_count;
    if (typeof nextFollowers === 'number') {
      setFollowerCount(nextFollowers);
    }
  }, [page.isFollowing, page.postCount, page.followerCount, page.follower_count]);

  // REBUILT: Handle follow toggle
  const handleJoinToggle = async () => {
    if (!isAuthenticated || !page.id) {
      onJoin?.();
      return;
    }

    setIsLoadingFollow(true);
    const currentFollowing = isFollowing;

    try {
      let response;
      
      if (currentFollowing) {
        response = await pagesService.leavePage(page.id);
      } else {
        response = await pagesService.joinPage(page.id);
      }
      
      // API response: { message: "...", isFollowing: boolean, followerCount: number }
      const newIsFollowing = response?.isFollowing === true;

      setIsFollowing(newIsFollowing);
      if (typeof response?.followerCount === 'number') {
        setFollowerCount(response.followerCount);
      }

      onJoin?.();
    } catch (error) {
      console.error('Error toggling follow:', error);
      setIsFollowing(currentFollowing);
    } finally {
      setIsLoadingFollow(false);
    }
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 300); // Delay before showing
  };

  // Calculate position when card opens
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      if (spaceBelow < 280 && spaceAbove > spaceBelow) {
        setPosition('top');
        setCardPosition({
          top: rect.top - 8, // 8px gap
          left: rect.left + rect.width / 2
        });
      } else {
        setPosition('bottom');
        setCardPosition({
          top: rect.bottom + 8, // 8px gap
          left: rect.left + rect.width / 2
        });
      }
    }
  }, [isOpen]);

  const handleMouseLeave = (e: React.MouseEvent) => {
    // Don't close if moving to the card
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (cardRef.current?.contains(relatedTarget)) {
      return;
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150); // Shorter delay
  };

  const handleCardMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const cancelClose = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const hoverCard = isOpen && createPortal(
    <div
      ref={cardRef}
      onMouseEnter={cancelClose}
      onMouseLeave={handleCardMouseLeave}
      className={hoverCardShellClass}
      style={{
        top: position === 'top' ? 'auto' : `${cardPosition.top}px`,
        bottom: position === 'top' ? `${window.innerHeight - cardPosition.top}px` : 'auto',
        left: `${cardPosition.left}px`,
        transform: 'translateX(-50%)',
        transition: 'opacity 0.2s ease-out'
      }}
    >
          {/* Header with Cover Image and Logo Overlay */}
          <div className="relative h-24 overflow-visible bg-zinc-100 dark:bg-[#0a1020]">
            {/* Page Cover Image */}
            {(page.coverImage || page.coverImageUrl) ? (
              <>
                <div className="absolute inset-0 overflow-hidden">
                  <img 
                    src={page.coverImage || page.coverImageUrl} 
                    alt={`${page.name} cover`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent"></div>
                </div>
              </>
            ) : (
              <div className={hoverCardHeaderFallbackClass} />
            )}
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent animate-shimmer pointer-events-none"></div>
            
            {/* Logo positioned at bottom of header - similar to user dropdown */}
            <div className="absolute -bottom-8 left-4 z-20">
              <div className="w-16 h-16 rounded-xl overflow-hidden ring-1 ring-zinc-200/80 shadow-lg bg-zinc-100 dark:bg-zinc-800 dark:ring-white/10">
                <img 
                  src={page.logo || page.logoUrl || DEFAULT_PAGE_LOGO} 
                  alt={page.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = DEFAULT_PAGE_LOGO;
                  }}
                />
              </div>
            </div>
          </div>

          {/* Compact Content */}
          <div className="pt-10 px-4 pb-4">
            {/* Page Name - Compact */}
            <div className="mb-2">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {page.name}
                </h3>
                {page.category && (
                  <Badge className={hoverCardChipClass}>
                    {page.category}
                  </Badge>
                )}
              </div>
              {page.description && (
                <p className="line-clamp-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {page.description}
                </p>
              )}
            </div>

            {/* Compact Stats - Inline */}
            <div className="mb-3 flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <Users size={12} className="text-zinc-500 dark:text-zinc-400" strokeWidth={2} />
                <span className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                  {followerCount.toLocaleString()}
                </span>
                <span className="text-zinc-500 dark:text-zinc-400">followers</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText size={12} className="text-zinc-500 dark:text-zinc-400" strokeWidth={2} />
                <span className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                  {resolvedPostCount.toLocaleString()}
                </span>
                <span className="text-zinc-500 dark:text-zinc-400">posts</span>
              </div>
            </div>

            {/* Compact Actions */}
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={() => onViewPage?.()}
                className="flex-1 text-xs py-1.5"
              >
                View Page
              </Button>
              {isAuthenticated && (
                <Button
                  variant={isFollowing ? 'secondary' : 'primary'}
                  onClick={handleJoinToggle}
                  disabled={isLoadingFollow}
                  className="flex-1 text-xs py-1.5"
                >
                  {isLoadingFollow ? '...' : isFollowing ? 'Following' : 'Follow'}
                </Button>
              )}
              {!isAuthenticated && onJoin && (
                <Button
                  variant="secondary"
                  onClick={() => onJoin()}
                  className="flex-1 text-xs py-1.5"
                >
                  Join
                </Button>
              )}
            </div>
          </div>
    </div>,
    document.body
  );

  return (
    <>
      <div 
        className="relative inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={triggerRef}
      >
        {trigger}
      </div>
      {hoverCard}
    </>
  );
}

