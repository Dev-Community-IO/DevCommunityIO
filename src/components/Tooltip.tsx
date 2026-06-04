import { useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  delay?: number;
  /** Preferred side for sidebar / compact rails */
  side?: 'right' | 'left';
  /** Stretch trigger to full width (sidebar nav rows) */
  fullWidth?: boolean;
}

export function Tooltip({
  content,
  children,
  delay = 300,
  side = 'right',
  fullWidth = false,
}: TooltipProps) {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, transform: 'translateY(-50%)' });
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const calculatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const tooltipEl = tooltipRef.current;
    const tooltipWidth = tooltipEl?.offsetWidth ?? 120;
    const tooltipHeight = tooltipEl?.offsetHeight ?? 32;
    const gap = 8;
    const pad = 8;

    let top = rect.top + rect.height / 2;
    let left = side === 'right' ? rect.right + gap : rect.left - gap;
    let transform = side === 'right' ? 'translateY(-50%)' : 'translate(-100%, -50%)';

    if (side === 'right' && left + tooltipWidth > window.innerWidth - pad) {
      left = rect.left - gap;
      transform = 'translate(-100%, -50%)';
    } else if (side === 'left' && left - tooltipWidth < pad) {
      left = rect.right + gap;
      transform = 'translateY(-50%)';
    }

    const halfH = tooltipHeight / 2;
    top = Math.min(Math.max(top, pad + halfH), window.innerHeight - pad - halfH);

    setCoords({ top, left, transform });
  }, [side]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!show) return;

    const run = () => calculatePosition();
    run();
    const raf = requestAnimationFrame(run);

    const onUpdate = () => calculatePosition();
    window.addEventListener('scroll', onUpdate, true);
    window.addEventListener('resize', onUpdate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onUpdate, true);
      window.removeEventListener('resize', onUpdate);
    };
  }, [show, calculatePosition]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      calculatePosition();
      setShow(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShow(false);
  };

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={
          fullWidth
            ? 'flex w-full min-w-0 items-center justify-start text-left'
            : 'inline-flex items-center justify-center'
        }
      >
        {children}
      </span>

      {show &&
        createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            className="pointer-events-none fixed z-[99999] animate-fade-in"
            style={{
              top: coords.top,
              left: coords.left,
              transform: coords.transform,
            }}
          >
            <div className="whitespace-nowrap rounded-md border border-zinc-700/50 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-100 shadow-lg dark:bg-zinc-800">
              {content}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
