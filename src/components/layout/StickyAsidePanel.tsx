import { useEffect, useRef, useState, type ReactNode } from 'react';

type SidebarColumnWidth = 'nav' | 'navCompact' | 'right';

const columnWidthClass: Record<SidebarColumnWidth, string> = {
  /** Icon rail md–lg; full labels and sections from lg up */
  nav: 'w-16 lg:w-64 2xl:w-72',
  navCompact: 'w-16',
  right: 'w-64 md:w-64 lg:w-72 xl:w-80',
};

interface SidebarColumnProps {
  children: ReactNode;
  width?: SidebarColumnWidth;
  /** Breakpoint at which the column is shown (md = tablet+; mobile uses drawer menu). */
  showFrom?: 'md' | 'lg' | 'xl';
  className?: string;
}

const showFromClass = {
  md: 'hidden md:flex',
  lg: 'hidden lg:flex',
  xl: 'hidden xl:flex',
};

/**
 * Flex column that stretches to match main content height so sticky side panels
 * stay visible for the full scroll range (not only while the aside content is tall).
 */
export function SidebarColumn({
  children,
  width = 'nav',
  showFrom = 'md',
  className = '',
}: SidebarColumnProps) {
  return (
    <div
      className={`${showFromClass[showFrom]} flex-shrink-0 flex-col self-stretch min-h-0 ${columnWidthClass[width]} ${className}`.trim()}
    >
      {children}
    </div>
  );
}

interface StickyAsidePanelProps {
  children: ReactNode;
  className?: string;
  /** When false, content scrolls with the page instead of sticking below the header. */
  pin?: boolean;
}

const stickyTopClass = 'top-[calc(var(--layout-header-offset)+0.5rem)]';

const stickyMaxHeightClass =
  'max-h-[calc(100dvh-var(--layout-header-offset)-var(--layout-bottom-safe)-0.5rem)] sm:max-h-[calc(100dvh-var(--layout-header-offset)-0.75rem)]';

/**
 * Sticky wrapper for left nav and right rail; tall panels scroll inside the viewport.
 */
export function StickyAsidePanel({
  children,
  className = '',
  pin = true,
}: StickyAsidePanelProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    if (!pin) return;

    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === 'undefined') return;

    // rootMargin must be px or % (not rem) — Firefox throws otherwise and crashes the app
    const rootFontSize =
      parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const headerOffset = getComputedStyle(document.documentElement)
      .getPropertyValue('--layout-header-offset')
      .trim();
    const headerRem = headerOffset.endsWith('rem') ? parseFloat(headerOffset) : 6;
    const topMarginPx = Math.round((headerRem + 0.5) * rootFontSize);

    let observer: IntersectionObserver | undefined;
    try {
      observer = new IntersectionObserver(
        ([entry]) => setIsPinned(!entry.isIntersecting),
        {
          root: null,
          threshold: 0,
          rootMargin: `-${topMarginPx}px 0px 0px 0px`,
        }
      );
      observer.observe(sentinel);
    } catch {
      // Non-fatal: skip pinned shadow if observer cannot be created
    }

    return () => observer?.disconnect();
  }, [pin]);

  if (!pin) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col">
      <div ref={sentinelRef} className="h-px w-full shrink-0" aria-hidden />
      <div
        className={[
          'sticky-aside-panel sticky z-30 w-full min-h-0 self-start overflow-y-auto overscroll-y-contain',
          stickyTopClass,
          stickyMaxHeightClass,
          'transition-[box-shadow] duration-200',
          isPinned
            ? 'shadow-[0_8px_24px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.45)]'
            : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </div>
    </div>
  );
}
