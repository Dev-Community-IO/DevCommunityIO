import { useState, useRef, useEffect } from 'react';
import { Users, Calendar, TrendingUp, ExternalLink } from 'lucide-react';
import { Page } from '../types';

interface PageHoverCardProps {
  page: Page;
  children: React.ReactNode;
}

export function PageHoverCard({ page, children }: PageHoverCardProps) {
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
    const cardHeight = 280;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = rect.bottom + 8;
    let left = rect.left;

    if (left + cardWidth > viewportWidth) {
      left = rect.right - cardWidth;
    }

    if (left < 16) {
      left = 16;
    }

    if (top + cardHeight > viewportHeight) {
      top = rect.top - cardHeight - 8;
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
    <>
      <span
        ref={triggerRef as any}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-flex"
      >
        {children}
      </span>

      {showCard && (
        <div
          ref={cardRef}
          className="fixed z-[9999] animate-fade-in"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
          onMouseEnter={handleCardMouseEnter}
          onMouseLeave={handleCardMouseLeave}
        >
          <div className="w-80 p-4 rounded-xl backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-700 shadow-2xl">
            <div className="flex gap-3">
              <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 flex-shrink-0">
                <img src={page.logo} alt={page.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-base truncate">{page.name}</h4>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Organization Page
                </p>
              </div>
            </div>

            <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
              Official page for {page.name}. Follow for updates, announcements, and community content.
            </p>

            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Users size={14} />
                <span className="font-semibold">2.5k</span>
                <span>followers</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <TrendingUp size={14} />
                <span className="font-semibold">156</span>
                <span>posts</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
              <button className="flex-1 px-3 py-2 text-sm font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all">
                Follow
              </button>
              <button className="flex-1 px-3 py-2 text-sm font-semibold border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-1">
                <span>Visit</span>
                <ExternalLink size={12} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
