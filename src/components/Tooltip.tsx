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
    const gap = 8;

    const tooltipWidth = 200;
    const tooltipHeight = 40;

    let top = rect.top + scrollY - tooltipHeight - gap;
    let left = rect.left + scrollX + (rect.width / 2) - (tooltipWidth / 2);

    if (left < scrollX + 8) {
      left = scrollX + 8;
    }

    if (left + tooltipWidth > window.innerWidth + scrollX - 8) {
      left = window.innerWidth + scrollX - tooltipWidth - 8;
    }

    if (rect.top - tooltipHeight - gap < 8) {
      top = rect.bottom + scrollY + gap;
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
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-gray-900 dark:bg-gray-800 border-r border-b border-gray-700 rotate-45" />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
