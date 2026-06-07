import { useEffect, useRef, type ReactNode } from 'react';

interface InfiniteScrollProps {
  dataLength: number;
  next: () => void | Promise<void>;
  hasMore: boolean;
  loader?: ReactNode;
  endMessage?: ReactNode;
  className?: string;
  children: ReactNode;
  /** Scroll container id or element. Defaults to viewport. */
  scrollableTarget?: string | HTMLElement;
  /** Distance from bottom before triggering load. */
  rootMargin?: string;
  /** When true, shows the loader slot (pass from parent loading state). */
  isLoading?: boolean;
}

function resolveScrollRoot(target?: string | HTMLElement): Element | null {
  if (!target) return null;
  if (typeof target === 'string') {
    return document.getElementById(target.replace(/^#/, ''));
  }
  return target;
}

export function InfiniteScroll({
  dataLength,
  next,
  hasMore,
  loader,
  endMessage,
  className,
  children,
  scrollableTarget,
  rootMargin = '240px',
  isLoading = false,
}: InfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef(next);
  const fetchingRef = useRef(false);

  nextRef.current = next;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const root = resolveScrollRoot(scrollableTarget);

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || fetchingRef.current || isLoading) return;

        fetchingRef.current = true;
        Promise.resolve(nextRef.current()).finally(() => {
          fetchingRef.current = false;
        });
      },
      { root, rootMargin, threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [dataLength, hasMore, isLoading, rootMargin, scrollableTarget]);

  return (
    <div className={className}>
      {children}
      {hasMore ? (
        <>
          {isLoading ? loader : null}
          <div ref={sentinelRef} className="h-px w-full shrink-0" aria-hidden />
        </>
      ) : (
        endMessage ?? null
      )}
    </div>
  );
}

export default InfiniteScroll;
