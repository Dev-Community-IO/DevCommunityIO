import { useEffect, useState } from 'react';
import adsService, { PublicAd } from '../../services/api/ads.service';
import { AdSlot } from './AdSlot';

/**
 * Sponsored slots pinned at the very top of the right sidebar. Renders up to 2
 * active ads (the backend already caps it). Renders nothing when there are none.
 */
export function SidebarAds({ className = '' }: { className?: string }) {
  const [ads, setAds] = useState<PublicAd[]>([]);

  useEffect(() => {
    let alive = true;
    adsService.getAds('sidebar').then((a) => {
      if (alive) setAds(a);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (ads.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {ads.slice(0, 2).map((ad) => (
        <AdSlot key={ad.id} ad={ad} defaultMaxHeight={250} />
      ))}
    </div>
  );
}
