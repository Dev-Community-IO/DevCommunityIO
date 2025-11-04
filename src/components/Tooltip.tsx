import { useState, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  delay?: number;
}

export function Tooltip({ content, children, delay = 300 }: TooltipProps) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef<NodeJS.Timeout>();
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
    const scrollY = window.scrollY || window.pageYOffset;
    const scrollX = window.scrollX || window.pageXOffset;
    const gap = 10;

    // Estimate tooltip dimensions based on content
    const tooltipWidth = 120;
    const tooltipHeight = 36;

    // Position tooltip to the right (for left sidebar)
    let top = rect.top + scrollY + (rect.height / 2) - (tooltipHeight / 2);
    let left = rect.right + scrollX + gap;

    // If tooltip would go off right side of screen, position to the left
    if (left + tooltipWidth > window.innerWidth + scrollX - 8) {
      left = rect.left + scrollX - tooltipWidth - gap;
    }

    // If still off screen on left, position below
    if (left < scrollX + 8) {
      top = rect.bottom + scrollY + gap;
      left = rect.left + scrollX + (rect.width / 2) - (tooltipWidth / 2);
      
      // Keep it within screen bounds
      if (left < scrollX + 8) {
        left = scrollX + 8;
      }
      if (left + tooltipWidth > window.innerWidth + scrollX - 8) {
        left = window.innerWidth + scrollX - tooltipWidth - 8;
      }
    }

    // Ensure tooltip doesn't go off the top or bottom
    if (top < scrollY + 8) {
      top = scrollY + 8;
    }
    if (top + tooltipHeight > window.innerHeight + scrollY - 8) {
      top = window.innerHeight + scrollY - tooltipHeight - 8;
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
        setShow(true);
      }
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShow(false);
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

      {show && createPortal(
        <div
          className="fixed z-[99999] pointer-events-none animate-fade-in"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          <div className="px-3 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-gray-800 rounded-lg shadow-xl border border-gray-700 whitespace-nowrap">
            {content}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
