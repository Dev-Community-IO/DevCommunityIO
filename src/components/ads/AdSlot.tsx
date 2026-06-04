import { useEffect, useMemo, useRef, useState } from 'react';
import type { PublicAd } from '../../services/api/ads.service';
import adsService from '../../services/api/ads.service';

interface AdSlotProps {
  ad: PublicAd;
  /** Fallback max-height (px) when the ad doesn't specify one. */
  defaultMaxHeight?: number;
  className?: string;
  /** Show the little "Sponsored" label (default true). */
  showLabel?: boolean;
  /** Preview mode (admin): render only, no impression/click tracking. */
  preview?: boolean;
}

/**
 * Renders a single admin-managed HTML ad inside a SANDBOXED iframe so arbitrary
 * ad markup/JS is isolated from the app (no access to our cookies/DOM). The ad
 * is contained within its max-height (overflow hidden) and is fully responsive.
 * Impressions are counted once when the slot scrolls into view; clicks are
 * tracked (and the click-through opened) when a link_url is configured.
 */
export function AdSlot({ ad, defaultMaxHeight = 280, className = '', showLabel = true, preview = false }: AdSlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  const maxHeight = ad.maxHeight && ad.maxHeight > 0 ? ad.maxHeight : defaultMaxHeight;

  // Wrap the ad HTML in a minimal, responsive document. <base target="_blank">
  // makes the ad's own links open in a new tab (with allow-popups).
  const srcDoc = useMemo(
    () =>
      `<!doctype html><html><head><meta charset="utf-8">` +
      `<meta name="viewport" content="width=device-width,initial-scale=1">` +
      `<base target="_blank">` +
      `<style>html,body{margin:0;padding:0;overflow:hidden}*{box-sizing:border-box}` +
      `img,video,iframe,svg{max-width:100%}body{font-family:system-ui,-apple-system,sans-serif;` +
      `background:transparent;color:inherit}a{color:inherit}</style></head>` +
      `<body>${ad.htmlContent || ''}</body></html>`,
    [ad.htmlContent]
  );

  // Count an impression once, when the slot is actually visible.
  useEffect(() => {
    const el = containerRef.current;
    if (preview || !el || seen) return;
    if (typeof IntersectionObserver === 'undefined') {
      setSeen(true);
      adsService.trackImpression(ad.id);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          adsService.trackImpression(ad.id);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ad.id, seen]);

  const handleClick = async () => {
    if (!ad.linkUrl) return;
    if (preview) {
      window.open(ad.linkUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    const link = (await adsService.trackClick(ad.id)) || ad.linkUrl;
    if (link) window.open(link, '_blank', 'noopener,noreferrer');
  };

  const clickable = Boolean(ad.linkUrl);

  return (
    <div
      ref={containerRef}
      onClick={clickable ? handleClick : undefined}
      className={`group relative overflow-hidden rounded-xl border border-zinc-200/80 bg-white/80 shadow-sm transition-shadow dark:border-white/10 dark:bg-white/[0.03] ${
        clickable ? 'cursor-pointer hover:shadow-md' : ''
      } ${className}`}
      role={clickable ? 'link' : undefined}
      aria-label={clickable ? ad.title : undefined}
    >
      {showLabel && (
        <span className="pointer-events-none absolute right-1.5 top-1.5 z-10 rounded bg-black/45 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-white/90 backdrop-blur-sm">
          Sponsored
        </span>
      )}
      <iframe
        title={ad.title}
        srcDoc={srcDoc}
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms"
        loading="lazy"
        scrolling="no"
        // When a click-through link is configured, let the wrapper handle the
        // click (the iframe is just a banner); otherwise the ad is interactive.
        style={{ height: maxHeight, pointerEvents: clickable ? 'none' : 'auto' }}
        className="block w-full border-0 bg-transparent"
      />
    </div>
  );
}
