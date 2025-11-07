import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';
import { Badge } from './Badge';
import { Users, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import pagesService from '../services/api/pages.service';

const DEFAULT_PAGE_LOGO = 'https://api.dicebear.com/7.x/shapes/svg?seed=Adaex%20App';

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
  const timeoutRef = useRef<NodeJS.Timeout>();
  const cardRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const [cardPosition, setCardPosition] = useState({ top: 0, left: 0 });

  // Fetch follow status when card opens - same pattern as user follow
  useEffect(() => {
    if (isOpen && isAuthenticated && page.id && !user?.id) {
      // Wait for user to be available
      return;
    }
    
    if (isOpen && isAuthenticated && page.id && user?.id) {
      const fetchFollowStatus = async () => {
        try {
          // REBUILT: Fetch page data to get current follow status
          const pageResponse = await pagesService.getPage(page.id);
          const pageObj = pageResponse.page || pageResponse;
          
          // Extract isFollowing - MUST be boolean, default to false
          const isFollowingFromApi = pageObj?.isFollowing === true;
          
          setIsFollowing(isFollowingFromApi);
        } catch (error) {
          console.error('Error fetching follow status:', error);
        }
      };
      fetchFollowStatus();
    } else if (!isAuthenticated) {
      setIsFollowing(false);
    }
  }, [isOpen, page.id, isAuthenticated, user?.id]);

  // Initialize from prop if available (for immediate display)
  useEffect(() => {
    if (typeof page.isFollowing === 'boolean') {
      setIsFollowing(page.isFollowing);
    }
  }, [page.isFollowing]);

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
      
      // Update state immediately
      setIsFollowing(newIsFollowing);
      
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
          {/* Header with Cover Image and Logo Overlay */}
          <div className="relative h-24 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 overflow-visible">
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
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500"></div>
            )}
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent animate-shimmer pointer-events-none"></div>
            
            {/* Logo positioned at bottom of header - similar to user dropdown */}
            <div className="absolute -bottom-8 left-4 z-20">
              <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white dark:border-gray-900 shadow-xl bg-white dark:bg-gray-800">
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
                <h3 className="font-bold text-base text-gray-900 dark:text-white truncate">
                  {page.name}
                </h3>
                {page.category && (
                  <Badge className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {page.category}
                  </Badge>
                )}
              </div>
              {page.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                  {page.description}
                </p>
              )}
            </div>

            {/* Compact Stats - Inline */}
            <div className="flex items-center gap-4 mb-3 text-xs">
              <div className="flex items-center gap-1">
                <Users size={12} className="text-blue-500" />
                <span className="font-semibold text-gray-900 dark:text-white">{page.followerCount || page.follower_count || 0}</span>
                <span className="text-gray-500 dark:text-gray-400">followers</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText size={12} className="text-purple-500" />
                <span className="font-semibold text-gray-900 dark:text-white">{page.postCount || 0}</span>
                <span className="text-gray-500 dark:text-gray-400">posts</span>
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

