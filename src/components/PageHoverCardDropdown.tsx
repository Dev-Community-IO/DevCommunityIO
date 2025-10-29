import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';
import { Users, FileText } from 'lucide-react';

interface PageHoverCardDropdownProps {
  page: {
    id: string;
    name: string;
    logo: string;
    description?: string;
    memberCount?: number;
    postCount?: number;
  };
  trigger: React.ReactNode;
  onJoin?: () => void;
  onViewPage?: () => void;
}

export function PageHoverCardDropdown({ page, trigger, onJoin, onViewPage }: PageHoverCardDropdownProps) {
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
          {/* Compact Header with Logo Overlay */}
          <div className="relative h-16 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent animate-shimmer"></div>
            
            {/* Logo positioned at bottom of header */}
            <div className="absolute -bottom-8 left-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden border-3 border-white dark:border-gray-900 shadow-lg bg-white dark:bg-gray-800">
                <img src={page.logo} alt={page.name} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          {/* Compact Content */}
          <div className="pt-10 px-4 pb-4">
            {/* Page Name - Compact */}
            <div className="mb-2">
              <h3 className="font-bold text-base text-gray-900 dark:text-white truncate">
                {page.name}
              </h3>
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
                <span className="font-semibold text-gray-900 dark:text-white">{page.memberCount || 0}</span>
                <span className="text-gray-500 dark:text-gray-400">members</span>
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
              {onJoin && (
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

