import { useState, useRef, useEffect } from 'react';
import { MapPin, Calendar, TrendingUp } from 'lucide-react';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { VerifiedBadge } from './VerifiedBadge';
import { User } from '../types';

interface UserHoverCardProps {
  user: User;
  children: React.ReactNode;
}

export function UserHoverCard({ user, children }: UserHoverCardProps) {
  const [showCard, setShowCard] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef<NodeJS.Timeout>();
  const cardRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const calculatePosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const cardWidth = 320;
    const cardHeight = 300;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const gap = 8;

    let top = rect.top - cardHeight - gap;
    let left = rect.left + (rect.width / 2) - (cardWidth / 2);

    if (left + cardWidth > viewportWidth - 16) {
      left = viewportWidth - cardWidth - 16;
    }

    if (left < 16) {
      left = 16;
    }

    if (top < 16) {
      top = rect.bottom + gap;
    }

    setPosition({ top, left });
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        calculatePosition(triggerRef.current);
        setShowCard(true);
      }
    }, 300);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowCard(false);
  };

  const handleCardMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleCardMouseLeave = () => {
    setShowCard(false);
  };

  return (
    <span className="relative inline-flex">
      <span
        ref={triggerRef as any}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => e.stopPropagation()}
        className="inline-flex"
      >
        {children}
      </span>

      {showCard && (
        <div
          ref={cardRef}
          className="fixed z-[9999] animate-fade-in pointer-events-auto"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
          onMouseEnter={handleCardMouseEnter}
          onMouseLeave={handleCardMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-80 p-4 rounded-xl backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-700 shadow-2xl">
            <div className="flex gap-3">
              <Avatar src={user.avatar} alt={user.username} size="lg" className="w-16 h-16" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-base truncate">{user.username}</h4>
                  {user.isVerified && <VerifiedBadge size={16} />}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {user.walletAddress}
                </p>
              </div>
            </div>

            <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
              Passionate about blockchain technology and decentralized systems. Building the future of Web3.
            </p>

            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <TrendingUp size={14} />
                <span className="font-semibold">{user.reputation}</span>
                <span>rep</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Calendar size={14} />
                <span>Joined Jan 2024</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
              <button className="flex-1 px-3 py-2 text-sm font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all">
                Follow
              </button>
              <button className="flex-1 px-3 py-2 text-sm font-semibold border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                Message
              </button>
            </div>
          </div>
        </div>
      )}
    </span>
  );
}
