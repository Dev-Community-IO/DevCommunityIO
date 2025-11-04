import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { VerifiedBadge } from './VerifiedBadge';
import { MapPin, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import usersService from '../services/api/users.service';
import { useNavigate } from 'react-router-dom';

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
  const timeoutRef = useRef<NodeJS.Timeout>();
  const cardRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const [cardPosition, setCardPosition] = useState({ top: 0, left: 0 });
  
  const isOwnProfile = isAuthenticated && authUser && (authUser.id === user.id || authUser.username === user.username);

  // Check follow status when card opens
  useEffect(() => {
    if (isOpen && isAuthenticated && !isOwnProfile) {
      const checkFollowStatus = async () => {
        try {
          setIsCheckingFollow(true);
          const following = await usersService.isFollowing(user.id);
          setIsFollowing(following);
        } catch (error) {
          console.error('Failed to check follow status:', error);
        } finally {
          setIsCheckingFollow(false);
        }
      };
      checkFollowStatus();
    }
  }, [isOpen, user.id, isAuthenticated, isOwnProfile]);

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
      } else {
        await usersService.followUser(user.id);
        setIsFollowing(true);
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
      className={`
        fixed z-[9999] w-72 p-0 rounded-xl
        bg-white dark:bg-gray-900 backdrop-blur-xl
        border border-gray-200 dark:border-gray-700
        shadow-xl shadow-black/5 dark:shadow-black/30
        animate-in fade-in duration-200
        overflow-hidden pointer-events-auto
      `}
      style={{
        top: position === 'top' ? 'auto' : `${cardPosition.top}px`,
        bottom: position === 'top' ? `${window.innerHeight - cardPosition.top}px` : 'auto',
        left: `${cardPosition.left}px`,
        transform: 'translateX(-50%)',
        transition: 'opacity 0.2s ease-out'
      }}
    >
          {/* Header with Cover Image and Avatar Overlay */}
          <div className="relative h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 overflow-visible">
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
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"></div>
            )}
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent animate-shimmer pointer-events-none"></div>
            
            {/* Avatar positioned at bottom of header - circular, no square background */}
            <div className="absolute -bottom-8 left-4 z-20">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-3 border-white dark:border-gray-900 overflow-hidden shadow-xl bg-white dark:bg-gray-800">
                  <Avatar 
                    src={user.avatarUrl || user.avatar} 
                    alt={user.username} 
                    size="lg" 
                    className="w-full h-full rounded-full"
                  />
                </div>
                {/* Page Logo under avatar if post is for a page */}
                {page && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg overflow-hidden border-2 border-white dark:border-gray-900 bg-white dark:bg-gray-800 shadow-lg">
                    <img 
                      src={page.logo || page.logoUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(page.name || '')}`}
                      alt={page.name || 'Page'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(page.name || '')}`;
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
                <h3 className="font-bold text-base text-gray-900 dark:text-white truncate">
                  {user.pseudo || user.username}
                </h3>
                {user.isVerified && <VerifiedBadge size={14} />}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                @{user.username}
              </p>
            </div>

            {/* Bio - Compact */}
            {user.bio && (
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-3">
                {user.bio}
              </p>
            )}

            {/* Compact Stats - Inline */}
            <div className="flex items-center gap-3 mb-3 text-xs">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-gray-900 dark:text-white">{user.reputation}</span>
                <span className="text-gray-500 dark:text-gray-400">Rep</span>
              </div>
            </div>

            {/* Location & Website - Compact */}
            {(user.location || user.website) && (
              <div className="space-y-1 mb-3">
                {user.location && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                    <MapPin size={12} className="flex-shrink-0" />
                    <span className="truncate">{user.location}</span>
                  </div>
                )}
                {user.website && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <LinkIcon size={12} className="flex-shrink-0 text-gray-600 dark:text-gray-400" />
                    <a 
                      href={user.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="truncate text-blue-600 dark:text-blue-400 hover:underline"
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

