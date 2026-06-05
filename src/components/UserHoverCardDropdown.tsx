import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { VerifiedBadge } from './VerifiedBadge';
import { MapPin, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import usersService from '../services/api/users.service';
import { useNavigate } from 'react-router-dom';

const DEFAULT_PAGE_LOGO = 'https://api.dicebear.com/7.x/shapes/svg?seed=Adaex%20App';

const hoverCardShellClass =
  'fixed z-[9999] w-72 overflow-hidden rounded-xl border p-0 pointer-events-auto ' +
  'bg-white/95 border-zinc-200/80 shadow-lg shadow-black/5 backdrop-blur-xl ' +
  'animate-in fade-in duration-200 ' +
  'dark:border-white/10 dark:bg-zinc-900 dark:shadow-black/40';

const hoverCardHeaderFallbackClass =
  'absolute inset-0 bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-200 dark:from-[#0a1220] dark:via-[#060b14] dark:to-[#0a1020]';

interface UserHoverCardDropdownProps {
  user: {
    id: string;
    username: string;
    pseudo?: string;
    avatar: string;
    avatarUrl?: string;
    coverImage?: string;
    coverImageUrl?: string;
    bio?: string;
    location?: string;
    website?: string;
    reputation: number;
    isVerified: boolean;
    walletAddress?: string;
  };
  page?: {
    id?: string;
    name?: string;
    logo?: string;
    logoUrl?: string;
    slug?: string;
    isVerified?: boolean;
  };
  trigger: React.ReactNode;
  onFollow?: () => void;
  onViewProfile?: () => void;
}

export function UserHoverCardDropdown({ user, page, trigger, onFollow, onViewProfile }: UserHoverCardDropdownProps) {
  const { isAuthenticated, user: authUser } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom'>('bottom');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCheckingFollow, setIsCheckingFollow] = useState(false);
  const [followerCount, setFollowerCount] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const cardRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const [cardPosition, setCardPosition] = useState({ top: 0, left: 0 });
  
  const isOwnProfile = isAuthenticated && authUser && (authUser.id === user.id || authUser.username === user.username);

  // Check follow status and load stats when card opens
  useEffect(() => {
    if (!isOpen) return;

    const loadCardData = async () => {
      try {
        const stats = await usersService.getUserStats(user.username, { period: 'all' });
        const followers =
          typeof stats.followers === 'object' && stats.followers !== null
            ? Number((stats.followers as { total?: number }).total ?? 0)
            : Number(stats.followers ?? 0);
        setFollowerCount(followers);
      } catch (error) {
        console.error('Failed to load user stats:', error);
        setFollowerCount(null);
      }

      if (isAuthenticated && !isOwnProfile) {
        try {
          setIsCheckingFollow(true);
          const following = await usersService.isFollowing(user.id);
          setIsFollowing(following);
        } catch (error) {
          console.error('Failed to check follow status:', error);
        } finally {
          setIsCheckingFollow(false);
        }
      }
    };

    loadCardData();
  }, [isOpen, user.id, user.username, isAuthenticated, isOwnProfile]);

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
      
      if (spaceBelow < 320 && spaceAbove > spaceBelow) {
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

  const handleFollowClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      onFollow?.();
      return;
    }

    if (isOwnProfile) return;

    try {
      if (isFollowing) {
        await usersService.unfollowUser(user.id);
        setIsFollowing(false);
        setFollowerCount((prev) => (prev !== null ? Math.max(0, prev - 1) : prev));
      } else {
        await usersService.followUser(user.id);
        setIsFollowing(true);
        setFollowerCount((prev) => (prev !== null ? prev + 1 : prev));
      }
    } catch (error: any) {
      console.error('Failed to toggle follow:', error);
      alert(error?.message || 'Failed to update follow status');
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewProfile) {
      onViewProfile();
    } else {
      navigate(`/profile/${user.username}`);
    }
    setIsOpen(false);
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
          {/* Header with Cover Image and Avatar Overlay */}
          <div className="relative h-24 overflow-visible bg-zinc-100 dark:bg-[#0a1020]">
            {/* User Cover Image */}
            {(user.coverImage || user.coverImageUrl) ? (
              <>
                <div className="absolute inset-0 overflow-hidden">
                  <img 
                    src={user.coverImage || user.coverImageUrl} 
                    alt={`${user.username} cover`}
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
            
            {/* Avatar positioned at bottom of header - circular, no square background */}
            <div className="absolute -bottom-8 left-4 z-20">
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg">
                  <Avatar
                    src={user.avatarUrl || user.avatar}
                    alt={user.username}
                    size="lg"
                    className="w-full h-full rounded-full ring-0"
                  />
                </div>
                {/* Page Logo under avatar if post is for a page */}
                {page && (
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 overflow-hidden rounded-lg border-2 border-white bg-white shadow-lg dark:border-zinc-900 dark:bg-zinc-800">
                    <img 
                      src={page.logo || page.logoUrl || DEFAULT_PAGE_LOGO}
                      alt={page.name || 'Page'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = DEFAULT_PAGE_LOGO;
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Compact Content */}
          <div className="pt-10 px-4 pb-4">
            {/* Name & Badge - Compact */}
            <div className="mb-2">
              <div className="flex items-center gap-1.5">
                <h3 className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {user.pseudo || user.username}
                </h3>
                {user.isVerified && <VerifiedBadge size={14} />}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">@{user.username}</p>
            </div>

            {/* Bio - Compact */}
            {user.bio && (
              <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                {user.bio}
              </p>
            )}

            {/* Compact Stats - Inline */}
            <div className="mb-3 flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <span className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                  {Number(user.reputation || 0).toLocaleString()}
                </span>
                <span className="text-zinc-500 dark:text-zinc-400">Rep</span>
              </div>
              {followerCount !== null && (
                <div className="flex items-center gap-1">
                  <span className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                    {followerCount.toLocaleString()}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400">Followers</span>
                </div>
              )}
            </div>

            {/* Location & Website - Compact */}
            {(user.location || user.website) && (
              <div className="space-y-1 mb-3">
                {user.location && (
                  <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                    <MapPin size={12} className="shrink-0" strokeWidth={2} />
                    <span className="truncate">{user.location}</span>
                  </div>
                )}
                {user.website && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <LinkIcon size={12} className="shrink-0 text-zinc-500 dark:text-zinc-400" strokeWidth={2} />
                    <a 
                      href={user.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="truncate text-zinc-700 underline-offset-2 hover:underline dark:text-zinc-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {user.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Compact Actions */}
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={() => {
                  handleProfileClick({ stopPropagation: () => {} } as React.MouseEvent);
                }}
                className="flex-1 text-xs py-1.5"
              >
                Profile
              </Button>
              {!isOwnProfile && (
                <Button
                  variant={isFollowing ? 'secondary' : 'primary'}
                  onClick={() => {
                    handleFollowClick({ stopPropagation: () => {} } as React.MouseEvent);
                  }}
                  className="flex-1 text-xs py-1.5"
                  disabled={isCheckingFollow}
                >
                  {isCheckingFollow ? '...' : isFollowing ? 'Following' : 'Follow'}
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

