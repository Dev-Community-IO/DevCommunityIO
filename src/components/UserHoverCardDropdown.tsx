import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { VerifiedBadge } from './VerifiedBadge';
import { MapPin, Link as LinkIcon } from 'lucide-react';

interface UserHoverCardDropdownProps {
  user: {
    id: string;
    username: string;
    pseudo?: string;
    avatar: string;
    avatarUrl?: string;
    bio?: string;
    location?: string;
    website?: string;
    reputation: number;
    isVerified: boolean;
    walletAddress?: string;
  };
  trigger: React.ReactNode;
  onFollow?: () => void;
  onViewProfile?: () => void;
}

export function UserHoverCardDropdown({ user, trigger, onFollow, onViewProfile }: UserHoverCardDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom'>('bottom');
  const timeoutRef = useRef<NodeJS.Timeout>();
  const cardRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const [cardPosition, setCardPosition] = useState({ top: 0, left: 0 });

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
          {/* Compact Header with Avatar Overlay */}
          <div className="relative h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent animate-shimmer"></div>
            
            {/* Avatar positioned at bottom of header */}
            <div className="absolute -bottom-8 left-4">
              <div className="w-16 h-16 rounded-xl border-3 border-white dark:border-gray-900 overflow-hidden shadow-lg bg-white dark:bg-gray-800">
                <Avatar 
                  src={user.avatarUrl || user.avatar} 
                  alt={user.username} 
                  size="lg" 
                  className="w-full h-full"
                />
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
                onClick={() => onViewProfile?.()}
                className="flex-1 text-xs py-1.5"
              >
                Profile
              </Button>
              {onFollow && (
                <Button
                  variant="secondary"
                  onClick={() => onFollow()}
                  className="flex-1 text-xs py-1.5"
                >
                  Follow
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

